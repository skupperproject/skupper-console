// import { Flow } from './services/services.interfaces';

export type Row<T> = {
  details?: {
    host: string;
    ports: Array<{ portSource: string; portDest: string | undefined }>;
  };
  data: T;
  isOpen?: boolean;
};
