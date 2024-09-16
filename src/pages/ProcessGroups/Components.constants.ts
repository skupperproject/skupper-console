import SkEndTimeCell from '@core/components/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import { ComponentResponse } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { ComponentLabels, ComponentRoutesPaths } from './Components.enum';

export const ComponentsPaths = {
  path: ComponentRoutesPaths.Components,
  name: ComponentLabels.Section
};

export const CustomComponentCells = {
  TimestampCell: SkEndTimeCell,
  ComponentNameLinkCell: (props: SkLinkCellProps<ComponentResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ComponentRoutesPaths.Components}/${props.data.name}@${props.data.identity}`
    }),
  ProcessCountCell: (props: SkLinkCellProps<ComponentResponse>) =>
    SkLinkCell({
      ...props,
      fitContent: true,
      link: `${ComponentRoutesPaths.Components}/${props.data.name}@${props.data.identity}?type=${ComponentLabels.Processes}`
    })
};

export const ComponentColumns: SKTableColumn<ComponentResponse>[] = [
  {
    name: ComponentLabels.Name,
    prop: 'name' as keyof ComponentResponse,
    customCellName: 'ComponentNameLinkCell'
  },
  {
    name: ComponentLabels.Count,
    prop: 'processCount' as keyof ComponentResponse,
    customCellName: 'ProcessCountCell',
    width: 15
  },
  {
    name: ComponentLabels.Created,
    prop: 'startTime' as keyof ComponentResponse,
    customCellName: 'TimestampCell',
    width: 15
  }
];
