import HighlightValueCell from '@core/components/HighlightValueCell';
import { HighlightValueCellProps } from '@core/components/HighlightValueCell/HighightValueCell.interfaces';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { timeAgo } from '@core/utils/timeAgo';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { httpFlowPairsColumns, tcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPair.constants';
import { FlowPairLabels } from '@pages/shared/FlowPairs/FlowPair.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { ProcessPairsResponse, FlowPairsResponse, ProcessResponse } from 'API/REST.interfaces';

import { ProcessesLabels, ProcessesRoutesPaths } from './Processes.enum';

export const ProcessesPaths = {
  path: ProcessesRoutesPaths.Processes,
  name: ProcessesLabels.Section
};

export const CustomProcessPairCells = {
  ProcessConnectedLinkCell: (props: LinkCellProps<ProcessPairsResponse>) =>
    LinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.sourceName}@${props.data.sourceId}/${ProcessesLabels.Title}@${props.data.identity}@${props.data.protocol}`
    })
};

export const CustomProcessCells = {
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
      type: 'component',
      link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.groupName}@${props.data.groupIdentity}`
    }),
  ClientServerLatencyCell: (props: LinkCellProps<FlowPairsResponse>) =>
    formatLatency(props.data.counterFlow.latency + props.data.forwardFlow.latency),
  ByteFormatCell: (props: HighlightValueCellProps<FlowPairsResponse>) =>
    HighlightValueCell({ ...props, format: formatBytes })
};

export const processesTableColumns: SKColumn<ProcessResponse>[] = [
  {
    name: ProcessesLabels.Name,
    prop: 'name' as keyof ProcessResponse,
    customCellName: 'linkCell'
  },
  {
    name: ProcessesLabels.Component,
    prop: 'groupName' as keyof ProcessResponse,
    customCellName: 'linkComponentCell'
  },
  {
    name: ProcessesLabels.Site,
    prop: 'parentName' as keyof ProcessResponse,
    customCellName: 'linkCellSite'
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime' as keyof ProcessResponse,
    format: timeAgo,
    width: 15
  }
];

export const processesConnectedColumns: SKColumn<ProcessPairsResponse>[] = [
  {
    name: ProcessesLabels.Process,
    prop: 'destinationName' as keyof ProcessPairsResponse,
    customCellName: 'ProcessConnectedLinkCell'
  }
];

export const processesHttpConnectedColumns: SKColumn<ProcessPairsResponse>[] = [
  {
    name: ProcessesLabels.Process,
    prop: 'destinationName' as keyof ProcessPairsResponse,
    customCellName: 'ProcessConnectedLinkCell'
  },
  {
    name: ProcessesLabels.Protocol,
    prop: 'protocol' as keyof ProcessPairsResponse,
    modifier: 'fitContent'
  }
];

const oldTcpHiddenColumns: Record<string, { show: boolean }> = {
  [FlowPairLabels.Client]: {
    show: false
  },
  [FlowPairLabels.Site]: {
    show: false
  },
  [FlowPairLabels.Server]: {
    show: false
  },
  [FlowPairLabels.ServerSite]: {
    show: false
  }
};

const activeTcpHiddenColumns: Record<string, { show: boolean }> = {
  ...oldTcpHiddenColumns,
  [FlowPairLabels.Duration]: {
    show: false
  },
  [FlowPairLabels.FlowPairClosed]: {
    show: false
  }
};

const httpHiddenColumns: Record<string, { show: boolean }> = {
  [FlowPairLabels.From]: {
    show: false
  },
  [FlowPairLabels.To]: {
    show: false
  },
  [FlowPairLabels.Site]: {
    show: false
  },
  [FlowPairLabels.ServerSite]: {
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

export const processesSelectOptions: { name: string; id: string }[] = [
  {
    name: 'Process',
    id: 'name'
  },
  {
    name: 'Component',
    id: 'groupName'
  },
  {
    name: 'Site',
    id: 'parentName'
  }
];
