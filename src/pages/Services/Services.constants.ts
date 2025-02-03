import ConnectorProcessCountCell from './components/ConnectorProcessCountCell';
import { ServicesRoutesPaths } from './Services.enum';
import { SortDirection, TcpStatus } from '../../API/REST.enum';
import { BIG_PAGINATION_SIZE, EMPTY_VALUE_SYMBOL } from '../../config/app';
import { Labels } from '../../config/labels';
import { SkSelectOption } from '../../core/components/SkSelect';
import SkEndTimeCell from '../../core/components/SkTable/SkCustomCells/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '../../core/components/SkTable/SkCustomCells/SkLinkCell';
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
  ConnectorNameLinkCell: (props: SkLinkCellProps<ConnectorResponse>) =>
    SkLinkCell({
      ...props,
      type: 'connector'
    }),
  ListenerNameLinkCell: (props: SkLinkCellProps<ConnectorResponse>) =>
    SkLinkCell({
      ...props,
      type: 'listener'
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
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.sourceName}@${props.data.sourceId}`
    }),
  DestProcessNameLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
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
    prop: 'name',
    customCellName: 'ListenerNameLinkCell',
    width: 25
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
    prop: 'name',
    customCellName: 'ConnectorNameLinkCell',
    width: 25
  },
  {
    name: Labels.Site,
    prop: 'siteName',
    customCellName: 'SiteNameLinkCell'
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
    customCellName: 'ConnectorProcessCountCell',
    modifier: 'fitContent'
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
    format: formatBytes,
    modifier: 'fitContent'
  },
  {
    name: Labels.ByteRate,
    prop: 'byteRate',
    format: formatByteRate,
    modifier: 'fitContent'
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
