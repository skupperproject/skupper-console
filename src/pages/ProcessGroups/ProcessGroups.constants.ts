import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';
import { ProcessGroupResponse } from 'API/REST.interfaces';

import { ProcessGroupsLabels, ProcessGroupsRoutesPaths, ProcessGroupsTableColumns } from './ProcessGroups.enum';

export const ProcessGroupsPaths = {
  path: ProcessGroupsRoutesPaths.ProcessGroups,
  name: ProcessGroupsLabels.Section
};

export const CustomComponentCells = {
  ComponentNameLinkCell: (props: LinkCellProps<ProcessGroupResponse>) =>
    LinkCell({
      ...props,
      type: 'process',
      link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.name}@${props.data.identity}`
    }),
  ComponentProcessCountLinkCell: (props: LinkCellProps<ProcessGroupResponse>) =>
    LinkCell({
      ...props,
      fitContent: true,
      link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.name}@${props.data.identity}?type=${ProcessGroupsLabels.Processes}`
    })
};

export const processGroupsColumns: SKColumn<ProcessGroupResponse>[] = [
  {
    name: ProcessGroupsTableColumns.Name,
    prop: 'name' as keyof ProcessGroupResponse,
    customCellName: 'ComponentNameLinkCell'
  },
  {
    name: ProcessGroupsTableColumns.Count,
    prop: 'processCount' as keyof ProcessGroupResponse,
    customCellName: 'ComponentProcessCountLinkCell',
    width: 15
  }
];
