import ConnectorProcessCountCell from './components/ConnectorProcessCountCell';
import { ServicesRoutesPaths, ServicesLabels } from './Services.enum';
import { SortDirection, TcpStatus } from '../../API/REST.enum';
import { BIG_PAGINATION_SIZE, EMPTY_VALUE_SYMBOL } from '../../config/app';
import { BiFlowListLabels } from '../../core/components/SkBiFlowList/BiFlowList.enum';
import SkEndTimeCell from '../../core/components/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '../../core/components/SkLinkCell';
import { SankeyMetricOptions } from '../../core/components/SKSanckeyChart/SkSankey.constants';
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
import { ProcessesLabels, ProcessesRoutesPaths } from '../Processes/Processes.enum';
import { SitesRoutesPaths } from '../Sites/Sites.enum';

export const ServicesPaths = {
  path: ServicesRoutesPaths.Services,
  name: ServicesLabels.Section
};

export const TAB_0_KEY = ServicesLabels.Overview;
export const TAB_1_KEY = ServicesLabels.Pairs;
export const TAB_2_KEY = ServicesLabels.Requests;
export const TAB_3_KEY = ServicesLabels.OpenConnections;
export const TAB_4_KEY = ServicesLabels.OldConnections;
export const TAB_5_KEY = ServicesLabels.ListenersAndConnectors;

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
    name: ServicesLabels.RoutingKey,
    prop: 'name',
    customCellName: 'ServiceNameLinkCell'
  },
  {
    name: ServicesLabels.TransportProtocol,
    prop: 'protocol'
  },
  {
    name: ServicesLabels.ApplicationProtocols,
    prop: 'observedApplicationProtocols',
    customCellName: 'ApplicationProtocolCell'
  },
  {
    name: ServicesLabels.IsBound,
    prop: 'isBound'
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  }
];

// Listeners Table
export const ListenerColumns: SKTableColumn<ListenerResponse>[] = [
  {
    name: ServicesLabels.Name,
    prop: 'name'
  },
  {
    name: ServicesLabels.Site,
    prop: 'siteName',
    customCellName: 'SiteNameLinkCell'
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  }
];

// Connectors Table
export const ConnectorColumns: SKTableColumn<ConnectorResponse>[] = [
  {
    name: ServicesLabels.Name,
    prop: 'name'
  },
  {
    name: ServicesLabels.DestHost,
    prop: 'destHost'
  },
  {
    name: ServicesLabels.DestPort,
    prop: 'destPort'
  },
  {
    name: ServicesLabels.Processes,
    prop: 'count',
    customCellName: 'ConnectorProcessCountCell'
  },
  {
    name: ServicesLabels.Site,
    prop: 'siteName',
    customCellName: 'SiteNameLinkCell'
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  }
];

export const PairColumns: SKTableColumn<PairsWithInstantMetrics>[] = [
  {
    name: BiFlowListLabels.Client,
    prop: 'sourceName',
    customCellName: 'SourceProcessNameLinkCell'
  },
  {
    name: BiFlowListLabels.Site,
    prop: 'sourceSiteName' as keyof PairsWithInstantMetrics,
    customCellName: 'SourceSiteNameLinkCell'
  },
  {
    name: BiFlowListLabels.Server,
    prop: 'destinationName',
    customCellName: 'DestProcessNameLinkCell'
  },
  {
    name: BiFlowListLabels.ServerSite,
    prop: 'destinationSiteName' as keyof PairsWithInstantMetrics,
    customCellName: 'DestSiteNameLinkCell'
  },
  {
    name: ProcessesLabels.Bytes,
    prop: 'bytes',
    format: formatBytes
  },
  {
    name: ProcessesLabels.ByteRate,
    prop: 'byteRate',
    format: formatByteRate
  }
];

export const servicesSelectOptions: SkSelectOption[] = [
  {
    label: ServicesLabels.Name,
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

export const defaultMetricOption = SankeyMetricOptions[0].id;
