// import { Flow } from './services/services.interfaces';

export type Row<T> = {
  details?: {
    host: string;
    ports: Array<{ id: string; portSource: string; portDest: string | undefined; octets: number }>;
  };
  data: T;
};
