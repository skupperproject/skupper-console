import { TdProps } from '@patternfly/react-table';

export type NonNullableValue<T> = T extends null | undefined ? never : T;

export interface SKTableColumn<T> extends TdProps {
  name: string;
  prop?: keyof T; // Prop generally is referred to a item of a data model used to fill the rows. This value can be undefined if the column is not part of the data model. The view details column is an example of column without prop
  customCellName?: string;
  callback?: Function;
  format?: Function;
  columnDescription?: string;
  show?: boolean;
}
