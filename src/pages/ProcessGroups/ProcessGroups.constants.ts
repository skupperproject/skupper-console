import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';
import { ProcessGroupResponse } from 'API/REST.interfaces';

import { ProcessGroupsLabels, ProcessGroupsRoutesPaths, ProcessGroupsTableColumns } from './ProcessGroups.enum';

export const ProcessGroupsPaths = {
  path: ProcessGroupsRoutesPaths.ProcessGroups,
  name: ProcessGroupsLabels.Section
};

export const processGroupsColumns: SKColumn<ProcessGroupResponse>[] = [
  {
    name: ProcessGroupsTableColumns.Name,
    prop: 'name' as keyof ProcessGroupResponse,
    customCellName: 'linkCell'
  },
  {
    name: ProcessGroupsTableColumns.Count,
    prop: 'processCount' as keyof ProcessGroupResponse,
    width: 15
  }
];