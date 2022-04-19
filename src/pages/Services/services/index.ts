import { RESTApi } from '@models/API/REST';

import { Service } from './services.interfaces';

export const Services = {
  fetchServices: async (): Promise<Service[]> => RESTApi.fetchServices(),
};

export default Services;
