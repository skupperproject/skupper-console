import { ProcessResponse, ProcessGroupResponse } from 'API/REST.interfaces';

export interface Service extends ProcessGroupResponse {
    processes: ProcessResponse[];
}
