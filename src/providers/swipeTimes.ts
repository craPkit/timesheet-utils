import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import entries from 'lodash/entries';
import { ProjectMap } from '../types/projectMap';
import { roundDuration, toTime } from '../utils/time';
import { AprodaData, AprodaProjectEntry } from '../types/aproda.types';
import { BaseProvider } from './base';

export interface SwipeTimesEntry {
  Project: string;
  Task: string;
  Note: string;
  'Start date & time': string;
  'End date & time': string;
  'Start date': string;
  'Start time': string;
  'End date': string;
  'End time': string;
  Duration: string;
  'Duration in hours': string;
  Tags: string;
}

export class SwipeTimesProvider extends BaseProvider<SwipeTimesEntry> {
  static keys: {
    [key: string]: keyof SwipeTimesEntry;
  } = {
    startTime: 'Start time',
    endTime: 'End time',
    duration: 'Duration in hours',
    note: 'Note',
    startDate: 'Start date',
  };

  public sumProjectsPerDay(): AprodaData {
    return this.convertDays(groupEntriesByDay(this.data));
  }

  private groupDayByProjectTasks(day) {
    return groupBy(day, (obj) => {
      const project = this.projectMap[obj.Project] || this.defaultProject;
      return `${project}~${this.taskMap[project][obj.Task] || obj.Task || 0}`;
    })
  }

  private convertDays(days: Record<string, SwipeTimesEntry[]>) {
    return mapValues(days, (day) => {
      let dayStart: string = null;
      const startTime = SwipeTimesProvider.keys.startTime;
      const vals = values(day)
        .filter(Boolean)
        .sort((a, b) => toTime(a[startTime]) - toTime(b[startTime]));

      const [breakStart, breakTotal] = computeBreak(vals);

      const convertedDay = mapValues(
        this.groupDayByProjectTasks(day),
        (items) => {
          if (!items) {
            return null;
          }
          const duration = SwipeTimesProvider.keys.duration;
          const note = SwipeTimesProvider.keys.note;
          let time = null;
          const sum: Partial<AprodaProjectEntry> = items.reduce(
            (agg, it) => {
              // @ts-ignore
              agg[duration] += parseFloat(it[duration]);

              // ignore length-only entries
              if (!it[startTime] || it[startTime] === '00:00:00') {
                return agg;
              }

              time = !time || time > it[startTime] ? it[startTime] ?? null : time;
              return agg;
            },
            {
              [duration]: 0,
            },
          );
          sum[note] = [...new Set(items.map((it) => it[note]).filter(Boolean))].join(';');
          // @ts-ignore
          sum[duration] = roundDuration(sum[duration]);
          sum[startTime] = time;
          if (time && (!dayStart || dayStart > time)) {
            dayStart = time;
          }
          return sum;
        },
      );
      return {
        data: entries(convertedDay).map(([key, val]) => recordEntryToAprodaEntry(key, val)),
        breakTime: (breakStart && breakStart.slice(0, 5)) || '',
        startTime: dayStart.slice(0, 5),
        breakTotal: `${Math.round(breakTotal / (1000 * 60))}`,
      };
    });
  }
}

function groupEntriesByDay(data: SwipeTimesEntry[]): Record<string, SwipeTimesEntry[]> {
  const startDateKey = SwipeTimesProvider.keys.startDate;
  return groupBy(
    data.map((it) => ({
      ...it,
      [startDateKey]: new Date(it[startDateKey]).toLocaleDateString('de-at', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    })),
    startDateKey,
  );
}


function computeBreak(vals: SwipeTimesEntry[]): [string, number] {
  const startTime = SwipeTimesProvider.keys.startTime;
  const endTime = SwipeTimesProvider.keys.endTime;

  let breakTotal: number = 0;
  let firstBreak: string = '';
  vals.forEach((it, idx) => {
    if (!it[startTime] || it[startTime] === '00:00:00') {
      return;
    }
    const ref = vals[idx + 1];
    if (!ref || !ref[startTime]) {
      return;
    }
    const diff = toTime(ref[startTime]) - toTime(it[endTime]);
    breakTotal += diff;
    if (!firstBreak && diff > 20 * 60 * 1000) {
      firstBreak = it[endTime];
    }
  });

  return [firstBreak, breakTotal];
}

function recordEntryToAprodaEntry(key: string, val: Partial<AprodaProjectEntry>): AprodaProjectEntry {
  const [project, task] = key.split('~');
  return {
    project: project,
    task: task,
    duration: val[SwipeTimesProvider.keys.duration],
    note: val[SwipeTimesProvider.keys.note],
    startTime: val[SwipeTimesProvider.keys.startTime],
  };
}
