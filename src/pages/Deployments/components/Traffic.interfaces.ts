import { Traffic } from '../services/deployments.interfaces';

export interface TrafficTablesProps {
    httpConnectionsIn: Traffic[];
    httpConnectionsOut: Traffic[];
    tcpConnectionsIn: Traffic[];
    tcpConnectionsOut: Traffic[];
}
