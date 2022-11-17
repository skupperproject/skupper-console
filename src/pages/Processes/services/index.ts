import { RESTApi } from 'API/REST';
import { ProcessResponse } from 'API/REST.interfaces';

const ProcessesController = {
    getProcesses: async (): Promise<ProcessResponse[]> => RESTApi.fetchProcesses(),
    getProcess: async (id: string): Promise<ProcessResponse> => RESTApi.fetchProcess(id),
};

export default ProcessesController;
