import { ProcessResponse, ServiceResponse } from 'API/REST.interfaces';

export interface ServicesTableProps {
    services: ServiceResponse[];
}

export interface ProcessesTableProps {
    processes: ProcessResponse[];
}
