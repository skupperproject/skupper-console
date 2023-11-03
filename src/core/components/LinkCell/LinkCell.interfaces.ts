export interface LinkCellProps<T> {
  data: T;
  value: string | undefined;
  link: string;
  isDisabled?: boolean;
  type?: 'process' | 'site' | 'component' | 'service';
  fitContent?: boolean;
}
