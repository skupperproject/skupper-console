import ConnectorProcessCountCell from './components/ConnectorProcessCountCell';
import { ServicesRoutesPaths } from './Services.enum';
import { SortDirection, TcpStatus } from '../../API/REST.enum';
import { BIG_PAGINATION_SIZE, EMPTY_VALUE_SYMBOL } from '../../config/app';
import { Labels } from '../../config/labels';
import SkEndTimeCell from '../../core/components/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '../../core/components/SkLinkCell';
import { SkSelectOption } from '../../core/components/SkSelect';
import { formatByteRate, formatBytes } from '../../core/utils/formatBytes';
import {
  ServiceResponse,
  QueryFilters,
  ListenerResponse,
  ConnectorResponse,
  ProcessPairsResponse,
  PairsWithInstantMetrics
} from '../../types/REST.interfaces';
import { SKTableColumn } from '../../types/SkTable.interfaces';
import { ProcessesRoutesPaths } from '../Processes/Processes.enum';
import { SitesRoutesPaths } from '../Sites/Sites.enum';

export const ServicesPaths = {
  path: ServicesRoutesPaths.Services,
  name: Labels.Services
};

export const TAB_0_KEY = Labels.Overview;
export const TAB_1_KEY = Labels.Pairs;
export const TAB_2_KEY = Labels.Requests;
export const TAB_3_KEY = Labels.OpenConnections;
export const TAB_4_KEY = Labels.OldConnections;
export const TAB_5_KEY = Labels.ListenersAndConnectors;

export const customServiceCells = {
  ServiceNameLinkCell: (props: SkLinkCellProps<ServiceResponse>) =>
    SkLinkCell({
      ...props,
      type: 'service',
      link: `${ServicesRoutesPaths.Services}/${props.data.name}@${props.data.identity}`
    }),
  ProcessNameLinkCell: (props: SkLinkCellProps<ConnectorResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.target}@${props.data.processId}`
    }),
  SiteNameLinkCell: (props: SkLinkCellProps<ConnectorResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.siteName}@${props.data.siteId}`
    }),
  SourceProcessNameLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.sourceName}@${props.data.sourceId}`
    }),
  DestProcessNameLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.destinationName}@${props.data.destinationId}`
    }),
  SourceSiteNameLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.sourceSiteName}@${props.data.sourceSiteId}`
    }),
  DestSiteNameLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.destinationSiteName}@${props.data.destinationSiteId}`
    }),
  TimestampCell: SkEndTimeCell,
  ApplicationProtocolCell: ({ data }: SkLinkCellProps<ServiceResponse>) =>
    data?.observedApplicationProtocols.join(', ') || EMPTY_VALUE_SYMBOL,
  ConnectorProcessCountCell
};

// Services Table
export const ServiceColumns: SKTableColumn<ServiceResponse>[] = [
  {
    name: Labels.RoutingKey,
    prop: 'name',
    customCellName: 'ServiceNameLinkCell'
  },
  {
    name: Labels.TCP,
    prop: 'protocol'
  },
  {
    name: Labels.HTTP,
    prop: 'observedApplicationProtocols',
    customCellName: 'ApplicationProtocolCell'
  },
  {
    name: Labels.IsBound,
    prop: 'isBound'
  },
  {
    name: Labels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  }
];

// Listeners Table
export const ListenerColumns: SKTableColumn<ListenerResponse>[] = [
  {
    name: Labels.Name,
    prop: 'name'
  },
  {
    name: Labels.Site,
    prop: 'siteName',
    customCellName: 'SiteNameLinkCell'
  },
  {
    name: Labels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  }
];

// Connectors Table
export const ConnectorColumns: SKTableColumn<ConnectorResponse>[] = [
  {
    name: Labels.Name,
    prop: 'name'
  },
  {
    name: Labels.DestHost,
    prop: 'destHost'
  },
  {
    name: Labels.DestPort,
    prop: 'destPort'
  },
  {
    name: Labels.Processes,
    prop: 'count',
    customCellName: 'ConnectorProcessCountCell'
  },
  {
    name: Labels.Site,
    prop: 'siteName',
    customCellName: 'SiteNameLinkCell'
  },
  {
    name: Labels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  }
];

export const PairColumns: SKTableColumn<PairsWithInstantMetrics>[] = [
  {
    name: Labels.Client,
    prop: 'sourceName',
    customCellName: 'SourceProcessNameLinkCell'
  },
  {
    name: Labels.Site,
    prop: 'sourceSiteName' as keyof PairsWithInstantMetrics,
    customCellName: 'SourceSiteNameLinkCell'
  },
  {
    name: Labels.Server,
    prop: 'destinationName',
    customCellName: 'DestProcessNameLinkCell'
  },
  {
    name: Labels.ServerSite,
    prop: 'destinationSiteName' as keyof PairsWithInstantMetrics,
    customCellName: 'DestSiteNameLinkCell'
  },
  {
    name: Labels.Bytes,
    prop: 'bytes',
    format: formatBytes
  },
  {
    name: Labels.ByteRate,
    prop: 'byteRate',
    format: formatByteRate
  }
];

export const servicesSelectOptions: SkSelectOption[] = [
  {
    label: Labels.Name,
    id: 'name'
  }
];

// Filters
export const initActiveConnectionsQueryParams: QueryFilters = {
  state: TcpStatus.Active,
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

export const initTerminatedConnectionsQueryParams: QueryFilters = {
  state: TcpStatus.Terminated,
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

export const initRequestsQueryParams: QueryFilters = {
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};
