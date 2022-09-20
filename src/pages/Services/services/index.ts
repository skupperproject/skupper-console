import { RESTApi } from 'API/REST';
import { ServiceResponse } from 'API/REST.interfaces';

import { Service } from './services.interfaces';

const ServicesController = {
    getServices: async (): Promise<ServiceResponse[]> => RESTApi.fetchServices(),
    getService: async (id: string): Promise<Service> => {
        const service = await RESTApi.fetchService(id);
        const processes = await RESTApi.fetchProcessesByServices(id);

        return { processes, ...service };
    },
};

export default ServicesController;
