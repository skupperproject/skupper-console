import { SKTableColumn } from 'types/SkTable.interfaces';

import { Labels } from '../../../config/labels';
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
    name: Labels.Closed,
    prop: 'endTime',
    customCellName: 'TimestampCell'
  },
  {
    name: Labels.Duration,
    prop: 'duration',
    customCellName: 'DurationCell'
  },
  {
    name: Labels.Client,
    prop: 'sourceProcessName',
    customCellName: 'ProcessNameLinkCell'
  },
  {
    name: Labels.Site,
    prop: 'sourceSiteName',
    customCellName: 'SiteNameLinkCell'
  },
  {
    name: Labels.Server,
    prop: 'destProcessName',
    customCellName: 'TargetProcessNameLinkCell'
  },
  {
    name: Labels.ServerSite,
    prop: 'destSiteName',
    customCellName: 'TargetSiteNameLinkCell'
  },
  {
    name: Labels.Port,
    prop: 'sourcePort'
  },
  {
    name: Labels.BytesOut,
    prop: 'octetCount',
    format: formatBytes,
    modifier: 'fitContent'
  },
  {
    name: Labels.BytesIn,
    prop: 'octetReverseCount',
    format: formatBytes,
    modifier: 'fitContent'
  },
  {
    name: Labels.LatencyOut,
    prop: 'latency',
    format: formatLatency,
    modifier: 'fitContent'
  },
  {
    name: Labels.LatencyIn,
    prop: 'latencyReverse',
    format: formatLatency,
    modifier: 'fitContent'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

export const httpBiFlowColumns: SKTableColumn<BiFlowResponse>[] = [
  {
    name: Labels.Completed,
    prop: 'endTime',
    customCellName: 'TimestampCell'
  },
  {
    name: Labels.FromClient,
    prop: 'sourceProcessName',
    customCellName: 'ProcessNameLinkCell'
  },
  {
    name: Labels.Site,
    prop: 'sourceSiteName',
    customCellName: 'SiteNameLinkCell'
  },
  {
    name: Labels.ToServer,
    prop: 'destProcessName',
    customCellName: 'TargetProcessNameLinkCell'
  },
  {
    name: Labels.ServerSite,
    prop: 'destSiteName',
    customCellName: 'TargetSiteNameLinkCell'
  },
  {
    name: Labels.Protocol,
    prop: 'protocol'
  },
  {
    name: Labels.StatusCode,
    prop: 'status' as keyof BiFlowResponse
  },
  {
    name: Labels.Method,
    prop: 'method' as keyof BiFlowResponse
  },
  {
    name: Labels.BytesOut,
    prop: 'octetCount',
    format: formatBytes,
    modifier: 'fitContent'
  },
  {
    name: Labels.BytesIn,
    prop: 'octetReverseCount',
    format: formatBytes,
    modifier: 'fitContent'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

const defaultSelectOptions: SkSelectOption[] = [
  {
    label: Labels.Client,
    id: 'sourceProcessName'
  },
  {
    label: Labels.Server,
    id: 'destProcessName'
  },
  {
    label: Labels.Site,
    id: 'sourceSiteName'
  },
  {
    label: Labels.ServerSite,
    id: 'destSiteName'
  }
];

export const httpSelectOptions: SkSelectOption[] = [
  ...defaultSelectOptions,
  {
    label: Labels.Protocol,
    id: 'protocol'
  },
  {
    label: Labels.StatusCode,
    id: 'status'
  },
  {
    label: Labels.Method,
    id: 'method'
  }
];

export const tcpSelectOptions = defaultSelectOptions;
