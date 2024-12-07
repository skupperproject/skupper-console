import { SKTableColumn } from 'types/SkTable.interfaces';

import { BiFlowListLabels } from './BiFlowList.enum';
import { ProcessesRoutesPaths } from '../../../pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '../../../pages/Sites/Sites.enum';
import { BiFlowResponse, TransportFlowResponse } from '../../../types/REST.interfaces';
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
export const tcpBiFlowColumns: SKTableColumn<TransportFlowResponse>[] = [
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
    name: BiFlowListLabels.Port,
    prop: 'sourcePort' as keyof BiFlowResponse
  },
  {
    name: BiFlowListLabels.TxBytes,
    prop: 'octets',
    format: formatBytes
  },
  {
    name: BiFlowListLabels.RxBytes,
    prop: 'octetsReverse',
    format: formatBytes
  },
  {
    name: BiFlowListLabels.TxLatency,
    prop: 'latency',
    format: formatLatency
  },
  {
    name: BiFlowListLabels.RxLatency,
    prop: 'latencyReverse',
    format: formatLatency
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
    name: BiFlowListLabels.From,
    prop: 'sourceProcessName',
    customCellName: 'ProcessNameLinkCell'
  },
  {
    name: BiFlowListLabels.Site,
    prop: 'sourceSiteName',
    customCellName: 'SiteNameLinkCell'
  },
  {
    name: BiFlowListLabels.To,
    prop: 'destProcessName',
    customCellName: 'TargetProcessNameLinkCell'
  },
  {
    name: BiFlowListLabels.ServerSite,
    prop: 'destSiteName',
    customCellName: 'TargetSiteNameLinkCell'
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
    prop: 'method' as keyof BiFlowResponse
  },
  {
    name: BiFlowListLabels.TxBytes,
    prop: 'octets',
    format: formatBytes
  },
  {
    name: BiFlowListLabels.RxBytes,
    prop: 'octetsReverse',
    format: formatBytes
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
