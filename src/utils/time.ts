
export function toTime(timeVal: string): number {
  return new Date('1970/01/01 ' + timeVal).getTime();
}
export function roundDuration(duration: number): number {
  return Math.round((duration + 0.00001) * 10) / 10;
}
