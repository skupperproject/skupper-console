import { ComponentResponse } from '@API/REST.interfaces';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';

import { ComponentLabels, ComponentRoutesPaths } from './ProcessGroups.enum';

export const ProcessGroupsPaths = {
  path: ComponentRoutesPaths.ProcessGroups,
  name: ComponentLabels.Section
};

export const CustomComponentCells = {
  ComponentNameLinkCell: (props: SkLinkCellProps<ComponentResponse>) =>
    SkLinkCell({
      ...props,
      type: 'process',
      link: `${ComponentRoutesPaths.ProcessGroups}/${props.data.name}@${props.data.identity}`
    }),
  ComponentProcessCountLinkCell: (props: SkLinkCellProps<ComponentResponse>) =>
    SkLinkCell({
      ...props,
      fitContent: true,
      link: `${ComponentRoutesPaths.ProcessGroups}/${props.data.name}@${props.data.identity}?type=${ComponentLabels.Processes}`
    })
};

export const processGroupsColumns: SKColumn<ComponentResponse>[] = [
  {
    name: ComponentLabels.Name,
    prop: 'name' as keyof ComponentResponse,
    customCellName: 'ComponentNameLinkCell'
  },
  {
    name: ComponentLabels.Count,
    prop: 'processCount' as keyof ComponentResponse,
    customCellName: 'ComponentProcessCountLinkCell',
    width: 15
  }
];
