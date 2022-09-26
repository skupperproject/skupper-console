import { RESTApi } from 'API/REST';
import { ProcessResponse, ProcessGroupResponse } from 'API/REST.interfaces';

const ProcessGroupsController = {
    getProcessGroups: async (): Promise<ProcessGroupResponse[]> => RESTApi.fetchProcessGroups(),

    GetProcessGroup: async (id: string): Promise<ProcessGroupResponse> =>
        RESTApi.fetchProcessGroup(id),

    getProcessesByProcessGroup: async (id: string): Promise<ProcessResponse[]> =>
        RESTApi.fetchProcessesByProcessGroup(id),
};

export default ProcessGroupsController;
