import { RESTApi } from 'API/REST';
import { AddressResponse, ProcessResponse } from 'API/REST.interfaces';

const ProcessesController = {
    getProcesses: async (): Promise<ProcessResponse[]> => RESTApi.fetchProcesses(),
    getProcess: async (id: string): Promise<ProcessResponse> => RESTApi.fetchProcess(id),
    getAddressesByProcess: async (id: string): Promise<AddressResponse[]> =>
        RESTApi.fetchAddressesByProcess(id),
};

export default ProcessesController;
