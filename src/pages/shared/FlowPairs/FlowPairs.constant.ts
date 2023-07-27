import DurationCell from '@core/components/DurationCell';
import HighlightValueCell from '@core/components/HighlightValueCell';
import { HighlightValueCellProps } from '@core/components/HighlightValueCell/HighightValueCell.interfaces';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { timeAgo } from '@core/utils/timeAgo';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { FlowPairsResponse } from 'API/REST.interfaces';

import { FlowPairsColumnsNames } from './FlowPairs.enum';

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
  //TODO; BE need to fix it
  HttpStatusCell: (props: { data?: FlowPairsResponse }) =>
    props.data?.counterFlow?.result || props.data?.forwardFlow?.result || ''
};

export const tcpFlowPairsColumns: SKColumn<FlowPairsResponse>[] = [
  {
    name: FlowPairsColumnsNames.Client,
    prop: 'forwardFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'ProcessNameLinkCell'
  },
  {
    name: FlowPairsColumnsNames.Port,
    prop: 'forwardFlow.sourcePort' as keyof FlowPairsResponse,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.Site,
    prop: 'sourceSiteName' as keyof FlowPairsResponse,
    customCellName: 'SiteNameLinkCell'
  },
  {
    name: FlowPairsColumnsNames.TxBytes,
    prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
    customCellName: 'ByteFormatCell',
    format: formatBytes,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.RxBytes,
    prop: 'counterFlow.octets' as keyof FlowPairsResponse,
    customCellName: 'ByteFormatCell',
    format: formatBytes,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.TTFB,
    columnDescription: 'time elapsed between client and server',
    customCellName: 'ClientServerLatencyCell',
    width: 10
  },
  {
    name: FlowPairsColumnsNames.Server,
    prop: 'counterFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'TargetProcessNameLinkCell'
  },
  {
    name: FlowPairsColumnsNames.ServerSite,
    prop: 'destinationSiteName' as keyof FlowPairsResponse,
    customCellName: 'TargetSiteNameLinkCell'
  },
  {
    name: FlowPairsColumnsNames.Duration,
    customCellName: 'DurationCell',
    width: 10
  },
  {
    name: FlowPairsColumnsNames.Closed,
    prop: 'endTime' as keyof FlowPairsResponse,
    format: timeAgo,
    width: 10
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
    width: 10
  },
  {
    name: FlowPairsColumnsNames.StatusCode,
    prop: 'counterFlow.result' as keyof FlowPairsResponse,
    customCellName: 'HttpStatusCell',
    width: 10
  },
  {
    name: FlowPairsColumnsNames.From,
    prop: 'forwardFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'ProcessNameLinkCell'
  },
  {
    name: FlowPairsColumnsNames.To,
    prop: 'counterFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'TargetProcessNameLinkCell'
  },
  {
    name: FlowPairsColumnsNames.TxBytes,
    prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes
  },
  {
    name: FlowPairsColumnsNames.RxBytes,
    prop: 'counterFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes
  },
  {
    name: FlowPairsColumnsNames.TxLatency,
    prop: 'forwardFlow.latency' as keyof FlowPairsResponse,
    format: formatLatency
  },
  {
    name: FlowPairsColumnsNames.RxLatency,
    prop: 'counterFlow.latency' as keyof FlowPairsResponse,
    format: formatLatency
  },

  {
    name: FlowPairsColumnsNames.Completed,
    prop: 'endTime' as keyof FlowPairsResponse,
    format: timeAgo,
    width: 10
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];
