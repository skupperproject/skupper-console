import componentPairsData from './data/COMPONENT_PAIRS.json';
import componentsData from './data/COMPONENTS.json';
import connectorsData from './data/CONNECTORS.json';
import httpRequestsData from './data/HTTP_REQUESTS.json';
import linksData from './data/LINKS.json';
import listenersData from './data/LISTENERS.json';
import processPairsData from './data/PROCESS_PAIRS.json';
import processesData from './data/PROCESSES.json';
import servicesData from './data/SERVICES.json';
import sitePairsData from './data/SITE_PAIRS.json';
import sitesData from './data/SITES.json';
import tcpConnectionsData from './data/TCP_CONNECTIONS.json';
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

type SitesData = SiteResponse[];
type ComponentsData = ComponentResponse[];
type ComponentPairsData = PairsResponse[];
type ProcessesData = ProcessResponse[];
type SitePairsData = PairsResponse[];
type ProcessPairsData = ProcessPairsResponse[];
type ServicesData = ServiceResponse[];
type TcpConnectionsData = ConnectorResponse[];
type HttpRequestsData = ApplicationFlowResponse[];
type LinksData = RouterLinkResponse[];
type ListenersData = ListenerResponse[];
type ConnectorsData = ConnectorResponse[];

export type DataEntry<T> = {
  results: T[];
  count: number;
  timeRangeCount: number;
};

export type DataMap = {
  SITES: DataEntry<SiteResponse>;
  COMPONENTS: DataEntry<ComponentResponse>;
  COMPONENT_PAIRS: DataEntry<PairsResponse>;
  PROCESSES: DataEntry<ProcessResponse>;
  SITE_PAIRS: DataEntry<PairsResponse>;
  PROCESS_PAIRS: DataEntry<ProcessPairsResponse>;
  SERVICES: DataEntry<ServiceResponse>;
  TCP_CONNECTIONS: DataEntry<ConnectorResponse>;
  HTTP_REQUESTS: DataEntry<ApplicationFlowResponse>;
  LINKS: DataEntry<RouterLinkResponse>;
  LISTENERS: DataEntry<ListenerResponse>;
  CONNECTORS: DataEntry<ConnectorResponse>;
};

const createDataEntry = <T>(data: T[] | { results: T[] } | undefined | null): DataEntry<T> => {
  const results = Array.isArray(data) ? data : (data?.results ?? []);

  return {
    results,
    count: results.length,
    timeRangeCount: results.length
  };
};

const dataMap: DataMap = {
  SITES: createDataEntry<SiteResponse>(sitesData as unknown as SitesData),
  COMPONENTS: createDataEntry<ComponentResponse>(componentsData as unknown as ComponentsData),
  COMPONENT_PAIRS: createDataEntry<PairsResponse>(componentPairsData as unknown as ComponentPairsData),
  PROCESSES: createDataEntry<ProcessResponse>(processesData as unknown as ProcessesData),
  SITE_PAIRS: createDataEntry<PairsResponse>(sitePairsData as unknown as SitePairsData),
  PROCESS_PAIRS: createDataEntry<ProcessPairsResponse>(processPairsData as unknown as ProcessPairsData),
  SERVICES: createDataEntry<ServiceResponse>(servicesData as unknown as ServicesData),
  TCP_CONNECTIONS: createDataEntry<ConnectorResponse>(tcpConnectionsData as unknown as TcpConnectionsData),
  HTTP_REQUESTS: createDataEntry<ApplicationFlowResponse>(httpRequestsData as unknown as HttpRequestsData),
  LINKS: createDataEntry<RouterLinkResponse>(linksData as unknown as LinksData),
  LISTENERS: createDataEntry<ListenerResponse>(listenersData as unknown as ListenersData),
  CONNECTORS: createDataEntry<ConnectorResponse>(connectorsData as unknown as ConnectorsData)
};

export { dataMap };
