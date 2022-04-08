export interface Port {
  id: string;
  portSource: string;
  portDest: string | undefined;
  octets: number;
  endTime: number;
}
interface RowDetails {
  host: string;
  totalBytes: number;
  ports: Port[];
}

export type Row<T> = {
  details?: RowDetails;
  data: T;
};
