import { ProjectMap } from './types/projectMap';
import { SwipeTimesEntry, SwipeTimesProvider } from './providers/swipeTimes';

export function convertMonthFromCSV(config: ProjectMap, data: SwipeTimesEntry[]) {
  const provider = new SwipeTimesProvider(config, data);
  return provider.sumProjectsPerDay();
}
