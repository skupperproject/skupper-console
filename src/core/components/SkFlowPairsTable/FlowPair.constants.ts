import SkDurationCell from '@core/components/SKDurationCell';
import SkEndTimeCell from '@core/components/SkEndTimeCell';
import SkHighlightValueCell, { SkHighlightValueCellProps } from '@core/components/SkHighlightValueCell';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { FlowPairsResponse, HttpBiflow } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { FlowPairLabels } from './FlowPair.enum';

export const flowPairsComponentsTable = {
  ProcessNameLinkCell: (props: SkLinkCellProps<FlowPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.sourceProcessName}@${props.data.sourceProcessId}`
    }),
  SiteNameLinkCell: (props: SkLinkCellProps<FlowPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.sourceSiteName}@${props.data.sourceSiteId}`
    }),
  TargetSiteNameLinkCell: (props: SkLinkCellProps<FlowPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.destSiteName}@${props.data.destSiteId}`
    }),
  TargetProcessNameLinkCell: (props: SkLinkCellProps<FlowPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.destProcessName}@${props.data.destSiteId}`
    }),
  TimestampCell: SkEndTimeCell,
  DurationCell: SkDurationCell,
  ByteFormatCell: (props: SkHighlightValueCellProps<FlowPairsResponse>) =>
    SkHighlightValueCell({ ...props, format: formatBytes }),
  HttpStatusCell: (props: { data?: HttpBiflow }) =>
    props.data?.counterFlow?.result || props.data?.forwardFlow?.result || ''
};

// no wrap fix the column
export const tcpFlowPairsColumns: SKTableColumn<FlowPairsResponse>[] = [
  {
    name: FlowPairLabels.FlowPairClosed,
    prop: 'endTime' as keyof FlowPairsResponse,
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.Client,
    prop: 'sourceProcessName' as keyof FlowPairsResponse,
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
    prop: 'sourcePort' as keyof FlowPairsResponse,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.TxBytes,
    prop: 'octets' as keyof FlowPairsResponse,
    customCellName: 'ByteFormatCell',
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.TxLatency,
    columnDescription: 'The TCP latency primarily concerns the start of data transmission',
    prop: 'latency' as keyof FlowPairsResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.Server,
    prop: 'destProcessName' as keyof FlowPairsResponse,
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.ServerSite,
    prop: 'destSiteName' as keyof FlowPairsResponse,
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.RxBytes,
    prop: 'octetsReverse' as keyof FlowPairsResponse,
    customCellName: 'ByteFormatCell',
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.RxLatency,
    columnDescription: 'The TCP latency primarily concerns the start of data transmission',
    prop: 'latencyReverse' as keyof FlowPairsResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.Duration,
    prop: 'duration' as keyof FlowPairsResponse,
    customCellName: 'DurationCell',
    modifier: 'nowrap'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

export const httpFlowPairsColumns: SKTableColumn<FlowPairsResponse>[] = [
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
    prop: 'sourceProcessName' as keyof FlowPairsResponse,
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
    prop: 'octets' as keyof FlowPairsResponse,
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.TxLatency,
    prop: 'latency' as keyof FlowPairsResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.To,
    prop: 'destProcessName' as keyof FlowPairsResponse,
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.ServerSite,
    prop: 'destSiteName' as keyof FlowPairsResponse,
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: FlowPairLabels.RxBytes,
    prop: 'octetsReverse' as keyof FlowPairsResponse,
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: FlowPairLabels.RxLatency,
    prop: 'latencyReverse' as keyof FlowPairsResponse,
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
    id: 'sourceProcessName'
  },
  {
    name: FlowPairLabels.Server,
    id: 'destProcessName'
  },
  {
    name: FlowPairLabels.Site,
    id: 'sourceSiteName'
  },
  {
    name: FlowPairLabels.ServerSite,
    id: 'destSiteName'
  }
];

export const tcpSelectOptions = defaultSelectOptions;
export const httpSelectOptions = defaultSelectOptions;
