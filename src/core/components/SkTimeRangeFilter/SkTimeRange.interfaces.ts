export interface TimeRangeFilterProps {
  duration?: number;
  onSelectTimeInterval: ({
    start,
    end,
    duration
  }: {
    start: number | undefined;
    end: number | undefined;
    duration: number | undefined;
  }) => void;
}
