import SkDurationCell from '@core/components/SKDurationCell';
import SkEndTimeCell from '@core/components/SkEndTimeCell';
import SkHighlightValueCell, { SkHighlightValueCellProps } from '@core/components/SkHighlightValueCell';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { BiFlowResponse } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { BiFlowListLabels } from './BiFlowList.enum';
import { SkSelectOption } from '../SkSelect';

export const customCells = {
  ProcessNameLinkCell: (props: SkLinkCellProps<BiFlowResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.sourceProcessName}@${props.data.sourceProcessId}`
    }),
  SiteNameLinkCell: (props: SkLinkCellProps<BiFlowResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.sourceSiteName}@${props.data.sourceSiteId}`
    }),
  TargetSiteNameLinkCell: (props: SkLinkCellProps<BiFlowResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.destSiteName}@${props.data.destSiteId}`
    }),
  TargetProcessNameLinkCell: (props: SkLinkCellProps<BiFlowResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.destProcessName}@${props.data.destSiteId}`
    }),
  TimestampCell: SkEndTimeCell,
  DurationCell: SkDurationCell,
  ByteFormatCell: (props: SkHighlightValueCellProps<BiFlowResponse>) =>
    SkHighlightValueCell({ ...props, format: formatBytes })
};

// no wrap fix the column
export const tcpBiFlowColumns: SKTableColumn<BiFlowResponse>[] = [
  {
    name: BiFlowListLabels.Closed,
    prop: 'endTime' as keyof BiFlowResponse,
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.Client,
    prop: 'sourceProcessName' as keyof BiFlowResponse,
    customCellName: 'ProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.Site,
    prop: 'sourceSiteName' as keyof BiFlowResponse,
    customCellName: 'SiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.Port,
    prop: 'sourcePort' as keyof BiFlowResponse,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.TxBytes,
    prop: 'octets' as keyof BiFlowResponse,
    customCellName: 'ByteFormatCell',
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.TxLatency,
    columnDescription: 'The TCP latency primarily concerns the start of data transmission',
    prop: 'latency' as keyof BiFlowResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.Server,
    prop: 'destProcessName' as keyof BiFlowResponse,
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.ServerSite,
    prop: 'destSiteName' as keyof BiFlowResponse,
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.RxBytes,
    prop: 'octetsReverse' as keyof BiFlowResponse,
    customCellName: 'ByteFormatCell',
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.RxLatency,
    columnDescription: 'The TCP latency primarily concerns the start of data transmission',
    prop: 'latencyReverse' as keyof BiFlowResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.Duration,
    prop: 'duration' as keyof BiFlowResponse,
    customCellName: 'DurationCell',
    modifier: 'nowrap'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

export const httpBiFlowColumns: SKTableColumn<BiFlowResponse>[] = [
  {
    name: BiFlowListLabels.Completed,
    prop: 'endTime' as keyof BiFlowResponse,
    customCellName: 'TimestampCell',
    width: 15
  },
  {
    name: BiFlowListLabels.StatusCode,
    prop: 'code' as keyof BiFlowResponse,
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.Method,
    prop: 'method' as keyof BiFlowResponse,
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.From,
    prop: 'sourceProcessName' as keyof BiFlowResponse,
    customCellName: 'ProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.Site,
    prop: 'sourceSiteName' as keyof BiFlowResponse,
    customCellName: 'SiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.TxBytes,
    prop: 'octets' as keyof BiFlowResponse,
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.TxLatency,
    prop: 'latency' as keyof BiFlowResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.To,
    prop: 'destProcessName' as keyof BiFlowResponse,
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.ServerSite,
    prop: 'destSiteName' as keyof BiFlowResponse,
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.RxBytes,
    prop: 'octetsReverse' as keyof BiFlowResponse,
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.RxLatency,
    prop: 'latencyReverse' as keyof BiFlowResponse,
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

const defaultSelectOptions: SkSelectOption[] = [
  {
    label: BiFlowListLabels.Client,
    id: 'sourceProcessName'
  },
  {
    label: BiFlowListLabels.Server,
    id: 'destProcessName'
  },
  {
    label: BiFlowListLabels.Site,
    id: 'sourceSiteName'
  },
  {
    label: BiFlowListLabels.ServerSite,
    id: 'destSiteName'
  }
];

export const tcpSelectOptions = defaultSelectOptions;
export const httpSelectOptions = defaultSelectOptions;
