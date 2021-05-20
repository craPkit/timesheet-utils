
export interface AprodaProjectEntry {
  project: string;
  task: string;
  duration: string | number;
  note: string | number;
  startTime: string | number;
}

export interface AprodaData {
  [day: string]: {
    data: AprodaProjectEntry[];
    breakTime: string;
    startTime: string;
    breakTotal: string;
  };
}
