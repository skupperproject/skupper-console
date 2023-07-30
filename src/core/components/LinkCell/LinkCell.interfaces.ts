export interface LinkCellProps<T> {
  data: T;
  value: string;
  link: string;
  isDisabled?: boolean;
  type?: 'process' | 'site' | 'component' | 'service';
  fitContent?: boolean;
}
