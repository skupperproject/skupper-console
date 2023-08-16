import DurationCell from '@core/components/DurationCell';
import HighlightValueCell from '@core/components/HighlightValueCell';
import { HighlightValueCellProps } from '@core/components/HighlightValueCell/HighightValueCell.interfaces';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { timeAgo } from '@core/utils/timeAgo';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { FlowPairsResponse } from 'API/REST.interfaces';

import { FlowPairsColumnsNames } from './FlowPair.enum';

export const flowPairsComponentsTable = {
  ProcessNameLinkCell: (props: LinkCellProps<FlowPairsResponse>) =>
    LinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.forwardFlow.processName}@${props.data.forwardFlow.process}`
    }),
  SiteNameLinkCell: (props: LinkCellProps<FlowPairsResponse>) =>
    LinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.sourceSiteName}@${props.data.sourceSiteId}`
    }),
  TargetSiteNameLinkCell: (props: LinkCellProps<FlowPairsResponse>) =>
    LinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.destinationSiteName}@${props.data.destinationSiteId}`
    }),
  TargetProcessNameLinkCell: (props: LinkCellProps<FlowPairsResponse>) =>
    LinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.counterFlow.processName}@${props.data.counterFlow.process}`
    }),
  ClientServerLatencyCell: (props: LinkCellProps<FlowPairsResponse>) =>
    formatLatency(props.data.counterFlow.latency + props.data.forwardFlow.latency),
  DurationCell: (props: LinkCellProps<FlowPairsResponse>) =>
    DurationCell({ ...props, endTime: props.data.endTime || Date.now() * 1000, startTime: props.data.startTime }),
  ByteFormatCell: (props: HighlightValueCellProps<FlowPairsResponse>) =>
    HighlightValueCell({ ...props, format: formatBytes }),
  HttpStatusCell: (props: { data?: FlowPairsResponse }) =>
    props.data?.counterFlow?.result || props.data?.forwardFlow?.result || ''
};

// no wrap fix the column
export const tcpFlowPairsColumns: SKColumn<FlowPairsResponse>[] = [
  {
    name: FlowPairsColumnsNames.Client,
    prop: 'forwardFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'ProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.Port,
    prop: 'forwardFlow.sourcePort' as keyof FlowPairsResponse,
    modifier: 'fitContent'
  },

  {
    name: FlowPairsColumnsNames.Server,
    prop: 'counterFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },

  {
    name: FlowPairsColumnsNames.TxBytes,
    prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
    customCellName: 'ByteFormatCell',
    format: formatBytes,
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.RxBytes,
    prop: 'counterFlow.octets' as keyof FlowPairsResponse,
    customCellName: 'ByteFormatCell',
    format: formatBytes,
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.TTFB,
    columnDescription: 'time elapsed between client and server',
    customCellName: 'ClientServerLatencyCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.Duration,
    prop: 'duration' as keyof FlowPairsResponse,
    customCellName: 'DurationCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.Closed,
    prop: 'endTime' as keyof FlowPairsResponse,
    format: timeAgo,
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.Site,
    prop: 'sourceSiteName' as keyof FlowPairsResponse,
    customCellName: 'SiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.ServerSite,
    prop: 'destinationSiteName' as keyof FlowPairsResponse,
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

export const httpFlowPairsColumns: SKColumn<FlowPairsResponse>[] = [
  {
    name: FlowPairsColumnsNames.Method,
    prop: 'forwardFlow.method' as keyof FlowPairsResponse,
    modifier: 'nowrap'
  },
  {
    name: FlowPairsColumnsNames.StatusCode,
    prop: 'counterFlow.result' as keyof FlowPairsResponse,
    customCellName: 'HttpStatusCell',
    modifier: 'nowrap'
  },
  {
    name: FlowPairsColumnsNames.From,
    prop: 'forwardFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'ProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.To,
    prop: 'counterFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.TxBytes,
    prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: FlowPairsColumnsNames.RxBytes,
    prop: 'counterFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: FlowPairsColumnsNames.TxLatency,
    prop: 'forwardFlow.latency' as keyof FlowPairsResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: FlowPairsColumnsNames.RxLatency,
    prop: 'counterFlow.latency' as keyof FlowPairsResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: FlowPairsColumnsNames.Site,
    prop: 'sourceSiteName' as keyof FlowPairsResponse,
    customCellName: 'SiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.ServerSite,
    prop: 'destinationSiteName' as keyof FlowPairsResponse,
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairsColumnsNames.Completed,
    prop: 'endTime' as keyof FlowPairsResponse,
    format: timeAgo,
    modifier: 'truncate'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

export const defaultSelectOptions: { name: string; id: string }[] = [
  {
    name: 'Client',
    id: 'forwardFlow.processName'
  },
  {
    name: 'Server',
    id: 'counterFlow.processName'
  },
  {
    name: 'Site Client',
    id: 'sourceSiteName'
  },
  {
    name: 'Site Server',
    id: 'destinationSiteName'
  }
];

export const tcpSelectOptions = defaultSelectOptions;
export const httpSelectOptions = defaultSelectOptions;
