import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import HighlightValueCell from '@core/HighlightValueCell';
import { HighlightValueCellProps } from '@core/HighlightValueCell/HighightValueCell.interfaces';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { timeAgo } from '@core/utils/timeAgo';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { httpFlowPairsColumns, tcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPairs.constant';
import { FlowPairsColumnsNames } from '@pages/shared/FlowPairs/FlowPairs.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { ProcessPairsResponse, FlowPairsResponse, ProcessResponse } from 'API/REST.interfaces';

import {
  ProcessesLabels,
  ProcessesRoutesPaths,
  ProcessesTableColumns,
  ProcessPairsColumnsNames
} from './Processes.enum';

export const ProcessesPaths = {
  path: ProcessesRoutesPaths.Processes,
  name: ProcessesLabels.Section
};

export const ProcessesConnectedComponentsTable = {
  ProcessLinkCell: (props: LinkCellProps<ProcessPairsResponse>) =>
    LinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.destinationName}@${props.data.destinationId}`
    })
};

export const ProcessesComponentsTable = {
  linkCell: (props: LinkCellProps<ProcessResponse>) =>
    LinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.name}@${props.data.identity}`
    }),
  linkCellSite: (props: LinkCellProps<ProcessResponse>) =>
    LinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.parentName}@${props.data.parent}`
    }),
  linkComponentCell: (props: LinkCellProps<ProcessResponse>) =>
    LinkCell({
      ...props,
      type: 'service',
      link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.groupName}@${props.data.groupIdentity}`
    }),
  ClientServerLatencyCell: (props: LinkCellProps<FlowPairsResponse>) =>
    formatLatency(props.data.counterFlow.latency + props.data.forwardFlow.latency),
  exposedCell: (props: LinkCellProps<ProcessResponse>) =>
    props.data.processBinding === 'bound' ? ProcessesLabels.Exposed : ProcessesLabels.NotExposed,
  ByteFormatCell: (props: HighlightValueCellProps<FlowPairsResponse>) =>
    HighlightValueCell({ ...props, format: formatBytes })
};

export const processesTableColumns = [
  {
    name: ProcessesTableColumns.Name,
    prop: 'name' as keyof ProcessResponse,
    component: 'linkCell'
  },
  {
    name: ProcessesTableColumns.Component,
    prop: 'groupName' as keyof ProcessResponse,
    component: 'linkComponentCell'
  },
  {
    name: ProcessesTableColumns.Site,
    prop: 'parentName' as keyof ProcessResponse,
    component: 'linkCellSite'
  },
  {
    name: ProcessesTableColumns.Exposed,
    prop: 'processBinding' as keyof ProcessResponse,
    component: 'exposedCell'
  },
  {
    name: ProcessesTableColumns.Created,
    prop: 'startTime' as keyof ProcessResponse,
    format: timeAgo
  }
];

export const processesConnectedColumns: SKColumn<ProcessPairsResponse>[] = [
  {
    name: ProcessPairsColumnsNames.Process,
    prop: 'destinationName' as keyof ProcessPairsResponse,
    component: 'ProcessLinkCell'
  },
  {
    name: '',
    component: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

const oldTcpHiddenColumns: Record<string, { show: boolean }> = {
  [FlowPairsColumnsNames.Client]: {
    show: false
  },
  [FlowPairsColumnsNames.Site]: {
    show: false
  },
  [FlowPairsColumnsNames.Server]: {
    show: false
  },
  [FlowPairsColumnsNames.ServerSite]: {
    show: false
  }
};

const activeTcpHiddenColumns: Record<string, { show: boolean }> = {
  ...oldTcpHiddenColumns,
  [FlowPairsColumnsNames.Closed]: {
    show: false
  }
};

const httpHiddenColumns: Record<string, { show: boolean }> = {
  [FlowPairsColumnsNames.From]: {
    show: false
  },
  [FlowPairsColumnsNames.To]: {
    show: false
  }
};

export const httpColumns = httpFlowPairsColumns.map((flowPair) => ({
  ...flowPair,
  show: httpHiddenColumns[flowPair.name]?.show
}));

export const oldTcpColumns = tcpFlowPairsColumns.map((flowPair) => ({
  ...flowPair,
  show: oldTcpHiddenColumns[flowPair.name]?.show
}));

export const activeTcpColumns = tcpFlowPairsColumns.map((flowPair) => ({
  ...flowPair,
  show: activeTcpHiddenColumns[flowPair.name]?.show
}));
