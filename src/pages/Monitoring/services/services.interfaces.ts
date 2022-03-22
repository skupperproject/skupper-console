import { FlowsResponse } from '@models/API/REST.interfaces';

export type Flow = FlowsResponse;

export interface VansInfo {
  id: string;
  name: string;
  nunDevices: number;
  numFLows: number;
}
