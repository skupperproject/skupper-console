import { RESTApi } from '@models/API/REST';

import { Service } from './services.interfaces';

export const Services = {
  fetchServices: async (): Promise<Service[]> => {
    const services = await RESTApi.fetchServices();

    return services;
  },
};

export default Services;
