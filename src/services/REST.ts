import { RESTApi } from '../API/REST';

export const RESTServices = {
  fetchData: async (): Promise<any> => {
    const data = await RESTApi.fetchData();
    const siteId = await RESTApi.getSiteId();

    console.log(siteId);
    return data;
  },
};
