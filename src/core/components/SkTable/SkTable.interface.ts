export type WidthValue = 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 60 | 70 | 80 | 90 | 100;
type NonNullableValue<T> = T extends null | undefined ? never : T;

export interface SKTableProps<T> {
  columns: SKColumn<NonNullableValue<T>>[];
  rows?: NonNullableValue<T>[];
  rowsCount?: number;
  pageSizeStart?: number;
  title?: string;
  titleDescription?: string;
  components?: Record<string, Function>;
  borders?: boolean;
  isStriped?: boolean;
  isPlain?: boolean;
  shouldSort?: boolean;
  onGetFilters?: Function;
}

export interface SKColumn<T> {
  name: string;
  prop?: keyof T;
  component?: string;
  callback?: Function;
  format?: Function;
  width?: WidthValue;
  columnDescription?: string;
}
