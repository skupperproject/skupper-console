import { RESTApi } from '../API/REST';
import Adapter from './adapter';
import { DataVAN, SiteInfo } from './REST.interfaces';

export const RESTServices = {
  fetchData: async (): Promise<DataVAN> => {
    const [dataVAN] = await Promise.all([
      RESTApi.fetchData(),
      RESTApi.fetchSite(),
      RESTApi.fetchLinks(),
      RESTApi.fetchTargets(),
      RESTApi.fetchServices(),
    ]);
    const data: DataVAN = new Adapter(dataVAN).getData();

    return data;
  },
  fetchSiteInfo: async (): Promise<SiteInfo> => {
    const [data, siteId] = await Promise.all([RESTApi.fetchData(), RESTApi.fetchSite()]);

    const { site_id, site_name } =
      data.sites.find(({ site_id: id }) => id === siteId) || data.sites[0];

    return {
      siteId: site_id,
      siteName: site_name,
    };
  },
};

// function normalizeServices(
//   targets: TargetsResponse[],
//   services: ServicesResponse[],
// ): SiteInfoService[] {
//   const servicesNormalized: SiteInfoService[] = [];

//   services.forEach((service) => {
//     const serviceTarget = targets.find(({ name }) => name === service.name);

//     if (!serviceTarget) {
//       servicesNormalized.push(service);

//       return;
//     }

//     targets.forEach(({ name, type, ports }) => {
//       const endpoint = service?.endpoints?.find(({ target }) => target === name);

//       if (service && endpoint) {
//         servicesNormalized.push({ ...service, type, exposed: true, ports });
//       } else {
//         servicesNormalized.push({ type, name, exposed: false });
//       }
//     });
//   });

//   return servicesNormalized;
// }
