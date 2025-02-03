import { SKTableColumn } from 'types/SkTable.interfaces';

import { ProcessesRoutesPaths } from './Processes.enum';
import { Labels } from '../../config/labels';
import { SkSelectOption } from '../../core/components/SkSelect';
import SkEndTimeCell from '../../core/components/SkTable/SkCustomCells/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '../../core/components/SkTable/SkCustomCells/SkLinkCell';
import { formatByteRate, formatBytes } from '../../core/utils/formatBytes';
import { ProcessPairsResponse, ProcessResponse, PairsWithInstantMetrics } from '../../types/REST.interfaces';
import { ComponentRoutesPaths } from '../Components/Components.enum';
import { SitesRoutesPaths } from '../Sites/Sites.enum';

export const ProcessesPaths = {
  path: ProcessesRoutesPaths.Processes,
  name: Labels.Processes
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
      link: `${SitesRoutesPaths.Sites}/${props.data.siteName}@${props.data.siteId}`
    }),
  linkComponentCell: (props: SkLinkCellProps<ProcessResponse>) =>
    SkLinkCell({
      ...props,
      type: 'component',
      link: `${ComponentRoutesPaths.Components}/${props.data.componentName}@${props.data.componentId}`
    }),
  TimestampCell: SkEndTimeCell
};

export const CustomProcessPairCells = {
  ConnectedLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.destinationName}@${props.data.destinationId}?type=${Labels.Pairs}`
    }),
  viewDetailsLinkCell: (props: SkLinkCellProps<ProcessPairsResponse>) =>
    SkLinkCell({
      ...props,
      value: Labels.ViewDetails,
      link: `${ProcessesRoutesPaths.Processes}/${props.data.sourceName}@${props.data.sourceId}/${Labels.Pairs}@${props.data.identity}?type=${Labels.Pairs}`
    })
};

export const processesTableColumns: SKTableColumn<ProcessResponse>[] = [
  {
    name: Labels.Name,
    prop: 'name',
    customCellName: 'linkCell'
  },
  {
    name: Labels.Component,
    prop: 'componentName',
    customCellName: 'linkComponentCell'
  },
  {
    name: Labels.Site,
    prop: 'siteName',
    customCellName: 'linkCellSite'
  },
  {
    name: Labels.BindingState,
    prop: 'binding'
  },
  {
    name: Labels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  }
];

export const PairsListColumns: SKTableColumn<PairsWithInstantMetrics>[] = [
  {
    name: Labels.Name,
    prop: 'destinationName',
    customCellName: 'ConnectedLinkCell'
  },
  {
    name: Labels.TCP,
    prop: 'protocol',
    modifier: 'fitContent'
  },
  {
    name: Labels.HTTP,
    prop: 'observedApplicationProtocols',
    modifier: 'fitContent'
  },
  {
    name: Labels.Bytes,
    prop: 'bytes',
    format: formatBytes,
    modifier: 'fitContent'
  },
  {
    name: Labels.ByteRate,
    prop: 'byteRate',
    format: formatByteRate,
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
    id: 'componentName'
  },
  {
    label: 'Site',
    id: 'siteName'
  }
];
