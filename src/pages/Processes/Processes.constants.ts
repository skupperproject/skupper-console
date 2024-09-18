import SkEndTimeCell from '@core/components/SkEndTimeCell';
import SkExposedCell from '@core/components/SkExposedCell';
import SkHighlightValueCell, { SkHighlightValueCellProps } from '@core/components/SkHighlightValueCell';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/Components.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { ProcessPairsResponse, FlowPairsResponse, ProcessResponse } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { ProcessesLabels, ProcessesRoutesPaths } from './Processes.enum';

export const ProcessesPaths = {
  path: ProcessesRoutesPaths.Processes,
  name: ProcessesLabels.Section
};

export const CustomPairsCells = {
  ProcessConnectedLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.destinationName}@${props.data.destinationId}?type=${ProcessesLabels.ProcessPairs}`
    }),
  ByteFormatCell: (props: SkHighlightValueCellProps<FlowPairsResponse>) =>
    SkHighlightValueCell({ ...props, format: formatBytes }),
  ByteRateFormatCell: (props: SkHighlightValueCellProps<FlowPairsResponse>) =>
    SkHighlightValueCell({ ...props, format: formatByteRate }),
  LatencyFormatCell: (props: SkHighlightValueCellProps<FlowPairsResponse>) =>
    SkHighlightValueCell({ ...props, format: formatLatency }),
  viewDetailsLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      value: ProcessesLabels.GoToDetailsLink,
      link: `${ProcessesRoutesPaths.Processes}/${props.data.sourceName}@${props.data.sourceId}/${ProcessesLabels.ProcessPairs}@${props.data.identity}?type=${ProcessesLabels.ProcessPairs}`
    })
};

export const CustomProcessCells = {
  linkCell: (props: SkLinkCellProps<ProcessResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.name}@${props.data.identity}`
    }),
  linkCellSite: (props: SkLinkCellProps<ProcessResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.parentName}@${props.data.parent}`
    }),
  linkComponentCell: (props: SkLinkCellProps<ProcessResponse>) =>
    SkLinkCell({
      ...props,
      type: 'component',
      link: `${ComponentRoutesPaths.Components}/${props.data.groupName}@${props.data.groupIdentity}`
    }),
  ByteFormatCell: (props: SkHighlightValueCellProps<FlowPairsResponse>) =>
    SkHighlightValueCell({ ...props, format: formatBytes }),
  ByteRateFormatCell: (props: SkHighlightValueCellProps<FlowPairsResponse>) =>
    SkHighlightValueCell({ ...props, format: formatByteRate }),
  TimestampCell: SkEndTimeCell,
  ExposureCell: SkExposedCell
};

export const processesTableColumns: SKTableColumn<ProcessResponse>[] = [
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
    name: ProcessesLabels.ExposedTitle,
    prop: 'processBinding' as keyof ProcessResponse,
    customCellName: 'ExposureCell'
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime' as keyof ProcessResponse,
    customCellName: 'TimestampCell',
    modifier: 'fitContent',
    width: 15
  }
];

export const processesConnectedColumns: SKTableColumn<ProcessPairsResponse>[] = [
  {
    name: ProcessesLabels.Process,
    prop: 'destinationName' as keyof ProcessPairsResponse,
    customCellName: 'ProcessConnectedLinkCell'
  },
  {
    name: ProcessesLabels.Bytes,
    prop: 'bytes' as keyof ProcessPairsResponse,
    customCellName: 'ByteFormatCell',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.ByteRate,
    prop: 'byteRate' as keyof ProcessPairsResponse,
    customCellName: 'ByteRateFormatCell',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.Latency,
    prop: 'latency' as keyof ProcessPairsResponse,
    customCellName: 'LatencyFormatCell',
    modifier: 'fitContent'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

export const processesHttpConnectedColumns: SKTableColumn<ProcessPairsResponse>[] = [
  {
    name: ProcessesLabels.Process,
    prop: 'destinationName' as keyof ProcessPairsResponse,
    customCellName: 'ProcessConnectedLinkCell'
  },
  {
    name: ProcessesLabels.Protocol,
    prop: 'protocol' as keyof ProcessPairsResponse,
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.Bytes,
    prop: 'bytes' as keyof ProcessPairsResponse,
    customCellName: 'ByteFormatCell',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.ByteRate,
    prop: 'byteRate' as keyof ProcessPairsResponse,
    customCellName: 'ByteRateFormatCell',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.Latency,
    prop: 'latency' as keyof ProcessPairsResponse,
    customCellName: 'LatencyFormatCell',
    modifier: 'fitContent'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

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
