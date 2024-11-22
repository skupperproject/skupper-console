import { SKTableColumn } from 'types/SkTable.interfaces';

import { BiFlowListLabels } from './BiFlowList.enum';
import { ProcessesRoutesPaths } from '../../../pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '../../../pages/Sites/Sites.enum';
import { BiFlowResponse } from '../../../types/REST.interfaces';
import { formatBytes } from '../../utils/formatBytes';
import { formatLatency } from '../../utils/formatLatency';
import SkDurationCell from '../SKDurationCell';
import SkEndTimeCell from '../SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '../SkLinkCell';
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
  DurationCell: SkDurationCell
};

// no wrap fix the column
export const tcpBiFlowColumns: SKTableColumn<BiFlowResponse>[] = [
  {
    name: BiFlowListLabels.Closed,
    prop: 'endTime',
    customCellName: 'TimestampCell',
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.Duration,
    prop: 'duration',
    customCellName: 'DurationCell',
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.Client,
    prop: 'sourceProcessName',
    customCellName: 'ProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.Site,
    prop: 'sourceSiteName',
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
    prop: 'octets',
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.TxLatency,
    columnDescription: 'The TCP latency primarily concerns the start of data transmission',
    prop: 'latency',
    format: formatLatency,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.Server,
    prop: 'destProcessName',
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.ServerSite,
    prop: 'destSiteName',
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.RxBytes,
    prop: 'octetsReverse',
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.RxLatency,
    columnDescription: 'The TCP latency primarily concerns the start of data transmission',
    prop: 'latencyReverse',
    format: formatLatency,
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
    prop: 'endTime',
    customCellName: 'TimestampCell',
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.Protocol,
    prop: 'protocol',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.StatusCode,
    prop: 'status' as keyof BiFlowResponse,
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.Method,
    prop: 'method' as keyof BiFlowResponse,
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.From,
    prop: 'sourceProcessName',
    customCellName: 'ProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.Site,
    prop: 'sourceSiteName',
    customCellName: 'SiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.TxBytes,
    prop: 'octets',
    format: formatBytes,
    modifier: 'nowrap'
  },
  {
    name: BiFlowListLabels.To,
    prop: 'destProcessName',
    customCellName: 'TargetProcessNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.ServerSite,
    prop: 'destSiteName',
    customCellName: 'TargetSiteNameLinkCell',
    modifier: 'fitContent'
  },
  {
    name: BiFlowListLabels.RxBytes,
    prop: 'octetsReverse',
    format: formatBytes,
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

export const httpSelectOptions: SkSelectOption[] = [
  ...defaultSelectOptions,
  {
    label: BiFlowListLabels.Protocol,
    id: 'protocol'
  },
  {
    label: BiFlowListLabels.StatusCode,
    id: 'status'
  },
  {
    label: BiFlowListLabels.Method,
    id: 'method'
  }
];

export const tcpSelectOptions = defaultSelectOptions;
