import { ServiceConnections } from 'API/REST.interfaces';

import { Site } from '../services/services.interfaces';

export interface SitesMetricsProps {
    site: Site;
    httpRequestsReceived: Record<string, ServiceConnections>;
    httpRequestsSent: Record<string, ServiceConnections>;
    tcpConnectionsIn: Record<string, ServiceConnections>;
    tcpConnectionsOut: Record<string, ServiceConnections>;
}
