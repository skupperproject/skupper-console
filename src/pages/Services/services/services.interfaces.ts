import { ProcessResponse, ServiceResponse } from 'API/REST.interfaces';

export interface Service extends ServiceResponse {
    processes: ProcessResponse[];
}
