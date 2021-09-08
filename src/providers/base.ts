import { ProjectMap } from '../types/projectMap';
import { AprodaData } from '../types/aproda.types';

export abstract class BaseProvider<T> {
  public constructor(private readonly config: ProjectMap, protected readonly data: T[]) {}

  get projectMap() {
    return this.config.projectMap || {};
  }

  get taskMap() {
    return this.config.taskMap || {};
  }

  get defaultProject() {
    return this.config.defaultProject || '';
  }

  public abstract sumProjectsPerDay(): AprodaData;
}
