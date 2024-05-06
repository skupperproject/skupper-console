import { ComponentResponse } from '@API/REST.interfaces';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';

import { ComponentLabels, ComponentRoutesPaths } from './ProcessGroups.enum';

export const ProcessGroupsPaths = {
  path: ComponentRoutesPaths.ProcessGroups,
  name: ComponentLabels.Section
};

export const CustomComponentCells = {
  ComponentNameLinkCell: (props: LinkCellProps<ComponentResponse>) =>
    LinkCell({
      ...props,
      type: 'process',
      link: `${ComponentRoutesPaths.ProcessGroups}/${props.data.name}@${props.data.identity}`
    }),
  ComponentProcessCountLinkCell: (props: LinkCellProps<ComponentResponse>) =>
    LinkCell({
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
