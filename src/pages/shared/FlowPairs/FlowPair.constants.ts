import { FlowPairsResponse } from '@API/REST.interfaces';
import DurationCell from '@core/components/DurationCell';
import EndTimeCell from '@core/components/EndTimeCell';
import HighlightValueCell from '@core/components/HighlightValueCell';
import { HighlightValueCellProps } from '@core/components/HighlightValueCell/HighightValueCell.interfaces';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { FlowPairLabels } from './FlowPair.enum';

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
  TimestampCell: (props: LinkCellProps<FlowPairsResponse>) => EndTimeCell(props),
  TcpTTFB: (props: LinkCellProps<FlowPairsResponse>) =>
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
    name: FlowPairLabels.FlowPairClosed,
    prop: 'endTime' as keyof FlowPairsResponse,
    customCellName: 'TimestampCell',
    width: 15
  },
  {
    name: FlowPairLabels.Client,
    prop: 'forwardFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'ProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.Site,
    prop: 'sourceSiteName' as keyof FlowPairsResponse,
    customCellName: 'SiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.Port,
    prop: 'forwardFlow.sourcePort' as keyof FlowPairsResponse,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.TxBytes,
    prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
    customCellName: 'ByteFormatCell',
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.Server,
    prop: 'counterFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.ServerSite,
    prop: 'destinationSiteName' as keyof FlowPairsResponse,
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.RxBytes,
    prop: 'counterFlow.octets' as keyof FlowPairsResponse,
    customCellName: 'ByteFormatCell',
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.Duration,
    prop: 'duration' as keyof FlowPairsResponse,
    customCellName: 'DurationCell',
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.TTFB,
    columnDescription: 'time elapsed between client and server',
    customCellName: 'TcpTTFB',
    modifier: 'nowrap'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

export const httpFlowPairsColumns: SKColumn<FlowPairsResponse>[] = [
  {
    name: FlowPairLabels.Completed,
    prop: 'endTime' as keyof FlowPairsResponse,
    customCellName: 'TimestampCell',
    width: 15
  },
  {
    name: FlowPairLabels.StatusCode,
    prop: 'counterFlow.result' as keyof FlowPairsResponse,
    customCellName: 'HttpStatusCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.Method,
    prop: 'forwardFlow.method' as keyof FlowPairsResponse,
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.From,
    prop: 'forwardFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'ProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.Site,
    prop: 'sourceSiteName' as keyof FlowPairsResponse,
    customCellName: 'SiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.TxBytes,
    prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.TxLatency,
    prop: 'forwardFlow.latency' as keyof FlowPairsResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.To,
    prop: 'counterFlow.processName' as keyof FlowPairsResponse,
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.ServerSite,
    prop: 'destinationSiteName' as keyof FlowPairsResponse,
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.RxBytes,
    prop: 'counterFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.RxLatency,
    prop: 'counterFlow.latency' as keyof FlowPairsResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

const defaultSelectOptions: { name: string; id: string }[] = [
  {
    name: FlowPairLabels.Client,
    id: 'forwardFlow.processName'
  },
  {
    name: FlowPairLabels.Server,
    id: 'counterFlow.processName'
  },
  {
    name: FlowPairLabels.Site,
    id: 'sourceSiteName'
  },
  {
    name: FlowPairLabels.ServerSite,
    id: 'destinationSiteName'
  }
];

export const tcpSelectOptions = defaultSelectOptions;
export const httpSelectOptions = defaultSelectOptions;
