import { RESTApi } from 'API/REST';
import { ProcessResponse, ServiceResponse } from 'API/REST.interfaces';

const ServicesController = {
    getServices: async (): Promise<ServiceResponse[]> => RESTApi.fetchServices(),

    getService: async (id: string): Promise<ServiceResponse> => RESTApi.fetchService(id),

    getProcessesByService: async (id: string): Promise<ProcessResponse[]> =>
        RESTApi.fetchProcessesByServices(id),
};

export default ServicesController;
