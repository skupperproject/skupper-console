import { ServiceConnections } from 'API/REST.interfaces';

export interface TableProps {
    rows: [string, ServiceConnections][];
}
