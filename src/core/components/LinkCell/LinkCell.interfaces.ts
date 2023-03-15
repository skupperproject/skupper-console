import { ReactNode } from 'react';

export interface LinkCellProps<T> {
  data: T;
  value: ReactNode;
  link: string;
  isDisabled?: boolean;
  type?: 'process' | 'site' | 'service' | 'address';
}
