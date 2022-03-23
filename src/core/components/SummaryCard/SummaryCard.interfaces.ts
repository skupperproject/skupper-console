import { SummaryCardColors } from './SummaryCard.enum';

export interface SummaryCardColumn {
  property: string;
  name: string;
}

export interface SummaryCardCell<T> {
  id: string;
  data: T;
  value: any;
}

export interface SummaryCardRow<T> {
  id: string;
  cells: SummaryCardCell<T>[];
}

export interface SummaryCardProps<T> {
  columns: SummaryCardColumn[];
  data: T[];
  color?: SummaryCardColors;
  label?: string;
  emptyMessage?: {
    title: string;
    description?: string;
  };
  styleCell?: Function;
}
