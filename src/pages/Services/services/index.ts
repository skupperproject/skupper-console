import { RESTApi } from 'API/REST';
import { ServiceResponse } from 'API/REST.interfaces';

const Services = {
    getServices: async (): Promise<ServiceResponse[]> => RESTApi.fetchServices(),
};

export default Services;
