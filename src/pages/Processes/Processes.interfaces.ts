import { ProcessResponse } from 'API/REST.interfaces';

export interface ProcessesTableProps {
  processes?: ProcessResponse[];
  onGetFilters?: Function;
  rowsCount?: number;
}
