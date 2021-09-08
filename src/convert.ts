import { ProjectMap } from './types/projectMap';
import { SwipeTimesEntry, SwipeTimesProvider } from './providers/swipeTimes';
import { AprodaData } from './types/aproda.types';

export function convertMonthFromCSV(config: ProjectMap, data: SwipeTimesEntry[]): AprodaData {
  const provider = new SwipeTimesProvider(config, data);
  return provider.sumProjectsPerDay();
}
