import { ProcessGroupResponse } from 'API/REST.interfaces';

import {
    ProcessGroupsLabels,
    ProcessGroupsRoutesPaths,
    ProcessGroupsTableColumns,
} from './ProcessGroups.enum';

export const ProcessGroupsPaths = {
    path: ProcessGroupsRoutesPaths.ProcessGroups,
    name: ProcessGroupsLabels.Section,
};

export const processGroupsColumns = [
    {
        name: ProcessGroupsTableColumns.Name,
        prop: 'name' as keyof ProcessGroupResponse,
        component: 'linkCell',
    },
];
