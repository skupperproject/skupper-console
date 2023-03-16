import { ReactNode } from 'react';

export interface DurationCellProps<T> {
  data: T;
  value: ReactNode;
  startTime: number;
  endTime?: number;
}
