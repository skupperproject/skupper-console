import { Flow } from '../models/services/REST.interfaces';

export type Row = {
  details: {
    host: string;
    ports: Array<{ portSource: string; portDest: string | undefined }>;
  };
  data: Flow;
  isOpen: boolean;
};
