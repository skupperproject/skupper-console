import SkEndTimeCell from '@core/components/SkEndTimeCell';
import SkExposedCell from '@core/components/SkExposedCell';
import SkHighlightValueCell, { SkHighlightValueCellProps } from '@core/components/SkHighlightValueCell';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import { SkSelectOption } from '@core/components/SkSelect';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/Components.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import {
  ProcessPairsResponse,
  BiFlowResponse,
  ProcessResponse,
  PairsWithInstantMetrics
} from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { ProcessesLabels, ProcessesRoutesPaths } from './Processes.enum';

export const ProcessesPaths = {
  path: ProcessesRoutesPaths.Processes,
  name: ProcessesLabels.Section
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
  ByteFormatCell: (props: SkHighlightValueCellProps<BiFlowResponse>) =>
    SkHighlightValueCell({ ...props, format: formatBytes }),
  ByteRateFormatCell: (props: SkHighlightValueCellProps<BiFlowResponse>) =>
    SkHighlightValueCell({ ...props, format: formatByteRate }),
  TimestampCell: SkEndTimeCell,
  ExposureCell: SkExposedCell
};

export const CustomPairMetricCells = {
  ByteFormatCell: (props: SkHighlightValueCellProps<BiFlowResponse>) =>
    SkHighlightValueCell({ ...props, format: formatBytes }),
  ByteRateFormatCell: (props: SkHighlightValueCellProps<BiFlowResponse>) =>
    SkHighlightValueCell({ ...props, format: formatByteRate }),
  LatencyFormatCell: (props: SkHighlightValueCellProps<BiFlowResponse>) =>
    SkHighlightValueCell({ ...props, format: formatLatency })
};

export const CustomProcessPairCells = {
  ...CustomPairMetricCells,
  ConnectedLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.destinationName}@${props.data.destinationId}?type=${ProcessesLabels.ProcessPairs}`
    }),
  viewDetailsLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      value: ProcessesLabels.GoToDetailsLink,
      link: `${ProcessesRoutesPaths.Processes}/${props.data.sourceName}@${props.data.sourceId}/${ProcessesLabels.ProcessPairs}@${props.data.identity}?type=${ProcessesLabels.ProcessPairs}`
    })
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

export const PairsListColumns: SKTableColumn<PairsWithInstantMetrics>[] = [
  {
    name: ProcessesLabels.Name,
    prop: 'destinationName',
    customCellName: 'ConnectedLinkCell'
  },
  {
    name: ProcessesLabels.TransportProtocol,
    prop: 'protocol',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.ApplicationProtocols,
    prop: 'observedApplicationProtocols',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.Bytes,
    prop: 'bytes',
    customCellName: 'ByteFormatCell',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.ByteRate,
    prop: 'byteRate',
    customCellName: 'ByteRateFormatCell',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.Latency,
    prop: 'latency',
    customCellName: 'LatencyFormatCell',
    modifier: 'fitContent'
  }
];

export const PairsListColumnsWithLinkDetails: SKTableColumn<PairsWithInstantMetrics>[] = [
  ...PairsListColumns,
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];

export const processesSelectOptions: SkSelectOption[] = [
  {
    label: 'Process',
    id: 'name'
  },
  {
    label: 'Component',
    id: 'groupName'
  },
  {
    label: 'Site',
    id: 'parentName'
  }
];
