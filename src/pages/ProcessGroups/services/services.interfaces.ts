import { ProcessResponse, ProcessGroupResponse } from 'API/REST.interfaces';

export interface ProcessGroupExtended extends ProcessGroupResponse {
    processes: ProcessResponse[];
}
