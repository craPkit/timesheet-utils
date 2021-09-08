import { convertMonthFromCSV } from './convert';
import { csv } from './setup';
import { ProjectMap } from './types/projectMap';
import { AprodaData, AprodaProjectEntry } from './types/aproda.types';

const topInputSelector =
  '#arbeitstagUserBereich > table:nth-child(4) > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(1) input';

let dataCache: AprodaData;

async function fillDay(projectMap: ProjectMap) {
  const data = await cachedData(projectMap);
  const day = data[await getAprodaDay()];
  fillBeginn(day.startTime);
  fillPause(day.breakTime, day.breakTotal);

  await Promise.all(day.data.map(setProject));
  /*
               const selects = [...document.querySelectorAll('select')].filter(select => ~select.id.indexOf('inHouseSelect'));
               selects.forEach(select => {
                   select.options.selectedIndex = 0;
                   select.dispatchEvent(new Event('change'));
               });
               window.setTimeout(() => {
                   const inputs = [...document.querySelectorAll('input')].filter(select => ~select.id.indexOf('tnOrt'));
                   inputs.forEach(input => {
                       input.value = 'Home Office';
                   });
               });
               return;
               */
}

async function setupEntries(projectMap: ProjectMap) {
  const data = await cachedData(projectMap);
  const day = data[await getAprodaDay()];
  if (day.data.length > 1) {
    await addEntries(day.data.length - 1);
  }
}

function markAllAsHomeOffice() {
  const selects = nodeListToArray(document.querySelectorAll('select')).filter((select) =>
    select.id.includes('inHouseSelect')
  );
  selects.forEach((select) => {
    select.options.selectedIndex = 0;
    select.dispatchEvent(new Event('change'));
  });
  window.setTimeout(() => {
    const inputs = nodeListToArray(document.querySelectorAll('input')).filter((select) => select.id.includes('tnOrt'));
    inputs.forEach((input) => {
      input.value = 'Home Office';
    });
  });
  return;
}

async function zeitausgleich() {
  fillBeginn('09:00');
  fillPause('', 1);
  await setProject({
    duration: 0,
    project: 'adesso AT/Zeitausgleich',
    task: 'Zeitausgleich',
    startTime: '09:00',
    note: ''
  }, 0)
}

async function urlaub() {
  fillBeginn('09:00');
  fillPause('12:00', 30);
  await setProject({
    duration: 7.7,
    project: 'adesso AT/Abwesenheit',
    task: 'Urlaub',
    startTime: '09:00',
    note: ''
  }, 0)
}

async function cachedData(projectMap: ProjectMap): Promise<AprodaData> {
  if (dataCache) {
    return dataCache;
  }
  const rawData = await csv.fromString(prompt('Paste SwipeTimes-exported CSV:'));
  const data = convertMonthFromCSV(projectMap, rawData);
  dataCache = data;
  return data;
}

function getAprodaDay(): string {
  const node = nodeListToArray(document.querySelectorAll('span.subHeadline')).filter((it) =>
    it.id.includes('arbeitstagUserBereich:aktTag')
  )[0];
  return node.textContent;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms || 0));
}

async function addEntries(count: number) {
  const select = nodeListToArray(document.querySelectorAll('select')).filter((it) =>
    it.name.includes('selectNewTnCount')
  )[0];
  select.options.selectedIndex = count - 1;
  select.dispatchEvent(new Event('change'));
  await sleep(100);

  await addEntry();
}

async function addEntry() {
  const button: HTMLButtonElement = document.querySelector(
    '#arbeitstagUserBereich > table:nth-child(10) > tbody > tr > td:nth-child(2) > span > table input[type="image"]'
  );
  button.click();
  return sleep(100);
}

function fillBeginn(startTime: string) {
  const field = document.querySelectorAll(topInputSelector)[0] as HTMLInputElement;
  field.value = startTime;
}

function fillPause(time: string, duration: string | number) {
  const field = document.querySelectorAll(topInputSelector)[1] as HTMLInputElement;
  field.value = time;
  const input = nodeListToArray(document.querySelectorAll('input')).filter((it) => it.id.includes('pauseLaenge'))[0];
  input.value = `${duration}`;
}

async function setProject(item: AprodaProjectEntry, idx: number) {
  const select = nodeListToArray(document.querySelectorAll('select')).filter((it) => it.id.includes('proSelect'))[idx];
  select.options.selectedIndex = nodeListToArray(select.options).findIndex((opt) => opt.text === item.project);
  select.dispatchEvent(new Event('change'));
  await sleep(100);

  await setTask(item, idx);

  await setDetails(item, idx);
}

async function setTask(item, idx) {
  const select = nodeListToArray(document.querySelectorAll('select')).filter((it) => it.id.includes('arbSelect'))[idx];
  select.options.selectedIndex = nodeListToArray(select.options).findIndex((opt) => opt.text === item.task);
  select.dispatchEvent(new Event('change'));
  await sleep(100);
}

async function setDetails(item, idx) {
  {
    const input = nodeListToArray(document.querySelectorAll('tr'))
      .filter((it) => it.className.includes('tableListeTD'))
      [idx].children[3].querySelector('input');
    input.value = item.duration;
    sleep(100);
  }
  {
    const input = nodeListToArray(document.querySelectorAll('input')).filter((it) => it.id.includes('taetigkeit'))[idx];
    input.value = item.note;
    sleep(100);
  }
}

function nodeListToArray<T extends Element>(list: NodeListOf<T> | HTMLCollectionOf<T> | T[]): T[] {
  // TODO: loop, yield and downlevel-iterate?
  // @ts-ignore
  return [...list];
}

// @ts-ignore
window.__User__AprodaUtils = {
  fillDay,
  setupEntries,
  markAllAsHomeOffice,
  zeitausgleich,
  urlaub
};
