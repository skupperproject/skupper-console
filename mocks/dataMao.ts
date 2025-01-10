import {
  SiteResponse,
  ComponentResponse,
  PairsResponse,
  ProcessResponse,
  ProcessPairsResponse,
  ServiceResponse,
  ConnectorResponse,
  ApplicationFlowResponse,
  RouterLinkResponse,
  ListenerResponse
} from '../src/types/REST.interfaces';
import sitesData from './data/SITES.json';
import componentsData from './data/COMPONENTS.json';
import componentPairsData from './data/COMPONENT_PAIRS.json';
import processesData from './data/PROCESSES.json';
import sitePairsData from './data/SITE_PAIRS.json';
import processPairsData from './data/PROCESS_PAIRS.json';
import servicesData from './data/SERVICES.json';
import tcpConnectionsData from './data/TCP_CONNECTIONS.json';
import httpRequestsData from './data/HTTP_REQUESTS.json';
import linksData from './data/LINKS.json';
import listenersData from './data/LISTENERS.json';
import connectorsData from './data/CONNECTORS.json';

export type DataMap = {
  SITES: SiteResponse[];
  COMPONENTS: ComponentResponse[];
  COMPONENT_PAIRS: PairsResponse[];
  PROCESSES: ProcessResponse[];
  SITE_PAIRS: PairsResponse[];
  PROCESS_PAIRS: ProcessPairsResponse[];
  SERVICES: ServiceResponse[];
  TCP_CONNECTIONS: ConnectorResponse[];
  HTTP_REQUESTS: ApplicationFlowResponse[];
  LINKS: RouterLinkResponse[];
  LISTENERS: ListenerResponse[];
  CONNECTORS: ConnectorResponse[];
};

const createDataEntry = (
  data: any[] | { results: any[] }
): { results: any[]; count: number; timeRangeCount: number } => {
  const results = Array.isArray(data) ? data : (data?.results ?? []);

  return {
    results,
    count: results.length,
    timeRangeCount: results.length
  };
};

const dataMap: Record<keyof DataMap, { results: any[]; count: number; timeRangeCount: number }> = {
  SITES: createDataEntry(sitesData),
  COMPONENTS: createDataEntry(componentsData),
  COMPONENT_PAIRS: createDataEntry(componentPairsData),
  PROCESSES: createDataEntry(processesData),
  SITE_PAIRS: createDataEntry(sitePairsData),
  PROCESS_PAIRS: createDataEntry(processPairsData),
  SERVICES: createDataEntry(servicesData),
  TCP_CONNECTIONS: createDataEntry(tcpConnectionsData),
  HTTP_REQUESTS: createDataEntry(httpRequestsData),
  LINKS: createDataEntry(linksData),
  LISTENERS: createDataEntry(listenersData),
  CONNECTORS: createDataEntry(connectorsData)
};

export { dataMap };
