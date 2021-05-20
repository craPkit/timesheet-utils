import entries from 'lodash/entries';
import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { AprodaData, AprodaProjectEntry } from './aproda';

export interface ProjectMap {
  defaultProject: string;
  projectMap: {
    [key: string]: string;
  };
  taskMap: {
    [project: string]: {
      [key: string]: string;
    };
  };
}

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

class SwipeTimesProvider {
  static keys: {
    [key: string]: keyof SwipeTimesEntry;
  } = {
    startTime: 'Start time',
    endTime: 'End time',
    duration: 'Duration in hours',
    note: 'Note',
    startDate: 'Start date',
  };

  constructor(private readonly config: ProjectMap, private readonly data: SwipeTimesEntry[]) {}

  get projectMap() {
    return this.config.projectMap || {};
  }

  get taskMap() {
    return this.config.taskMap || {};
  }

  get defaultProject() {
    return this.config.defaultProject || '';
  }

  sumProjectsPerDay(): AprodaData {
    const startDateKey = SwipeTimesProvider.keys.startDate;

    const days = groupBy(
      this.data.map((it) => ({
        ...it,
        [startDateKey]: new Date(it[startDateKey]).toLocaleDateString('de-at', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      })),
      startDateKey
    );
    return mapValues(days, (day) => {
      let dayStart: string = null;
      // let firstBreak = null;
      const startTime = SwipeTimesProvider.keys.startTime;
      const endTime = SwipeTimesProvider.keys.endTime;
      const vals = values(day)
        .filter(Boolean)
        .sort((a, b) => toTime(a[startTime]) - toTime(b[startTime]));

      let breakTotal = 0;
      let firstBreak = '';
      vals.forEach((it, idx) => {
        if (!it[startTime]) {
          return false;
        }
        const ref = vals[idx + 1];
        if (!ref || !ref[startTime]) {
          return false;
        }
        const diff = toTime(ref[startTime]) - toTime(it[endTime]);
        breakTotal += diff;
        if (!firstBreak && diff > 20 * 60 * 1000) {
          firstBreak = it[endTime];
        }
      });

      const convertedDay = mapValues(
        groupBy(day, (obj) => {
          const project = this.projectMap[obj.Project] || this.defaultProject;
          return `${project}~${this.taskMap[project][obj.Task] || 0}`;
        }),
        (items) => {
          if (!items) {
            return null;
          }
          const duration = SwipeTimesProvider.keys.duration;
          const note = SwipeTimesProvider.keys.note;
          let time = null;
          let endTime = null;
          const sum: Partial<AprodaProjectEntry> = items.reduce(
            (agg, it) => {
              // @ts-ignore
              agg[duration] += parseFloat(it[duration]);
              time = !time || time > it[startTime] ? it[startTime] ?? null : time;
              endTime = it[SwipeTimesProvider.keys.endTime];
              return agg;
            },
            {
              [duration]: 0,
            }
          );
          sum[note] = [...new Set(items.map((it) => it[note]).filter(Boolean))].join(';');
          // @ts-ignore
          sum[duration] = roundDuration(sum[duration]);
          sum[startTime] = time;
          if (time && (!dayStart || dayStart > time)) {
            dayStart = time;
          }
          return sum;
        }
      );
      return {
        data: entries(convertedDay).map((args) => {
          const [key, val] = args;
          const [project, task] = key.split('~');
          return {
            project: project,
            task: task,
            duration: val[SwipeTimesProvider.keys.duration],
            note: val[SwipeTimesProvider.keys.note],
            startTime: val[SwipeTimesProvider.keys.startTime],
          };
        }),
        breakTime: (firstBreak && firstBreak.slice(0, 5)) || '',
        startTime: dayStart.slice(0, 5),
        breakTotal: `${Math.round(breakTotal / (1000 * 60))}`,
      };
    });
  }
}

export function convertMonthFromCSV(config: ProjectMap, data: SwipeTimesEntry[]) {
  const provider = new SwipeTimesProvider(config, data);
  return provider.sumProjectsPerDay();
}

function toTime(timeVal: string): number {
  return new Date('1970/01/01 ' + timeVal).getTime();
}
function roundDuration(duration: number): number {
  return Math.round((duration + 0.00001) * 10) / 10;
}
