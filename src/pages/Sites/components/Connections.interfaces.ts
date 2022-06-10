import { HttpRequest, TCPRequest } from '../services/services.interfaces';

export interface ConnectionPropsHTTP {
    rows: HttpRequest[];
}

export interface ConnectionProps {
    rows: TCPRequest[];
}

export interface ConnectionsProps {
    httpRequests: HttpRequest[];
    tcpRequests: TCPRequest[];
}
