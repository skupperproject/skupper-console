export interface Port {
  id: string;
  portSource: string;
  portDest: string | undefined;
  octets: number;
  octetsIn: number;
  endTime?: number;
  latency: number;
  latencyIn: number;
}
interface RowDetails {
  host: string;
  totalBytes: number;
  totalBytesIn: number;
  ports: Port[];
}

export type Row<T> = {
  details?: RowDetails;
  data: T;
  totalBytes: number;
  totalBytesIn: number;
  avgLatency: number;
};
