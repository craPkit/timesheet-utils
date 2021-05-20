
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
