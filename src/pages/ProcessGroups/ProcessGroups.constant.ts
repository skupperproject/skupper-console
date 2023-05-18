import { SKColumn } from '@core/components/SkTable/SkTable.interface';
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
    component: 'linkCell'
  },
  {
    name: ProcessGroupsTableColumns.Count,
    prop: 'processCount' as keyof ProcessGroupResponse,
    width: 10
  }
];
