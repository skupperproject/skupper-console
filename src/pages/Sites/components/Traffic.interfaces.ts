import { HttpRequest, TCPRequest } from '../services/services.interfaces';

export interface RequestPropsHTTP {
    rows: HttpRequest[];
    siteName: string;
}

export interface ConnectionPropsTCP {
    rows: TCPRequest[];
    siteName: string;
}

export interface ConnectionsProps {
    httpRequests: HttpRequest[];
    tcpRequests: TCPRequest[];
    siteName: string;
}
