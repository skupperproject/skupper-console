import { RESTApi } from '../API/REST';
import { ServicesResponse, TargetsResponse } from '../API/REST.interfaces';
import { Data, Service } from './REST.interfaces';

export const RESTServices = {
  fetchData: async (): Promise<Data> => {
    const [data, siteId, links, targets, services] = await Promise.all([
      RESTApi.fetchData(),
      RESTApi.fetchSite(),
      RESTApi.fetchLinks(),
      RESTApi.fetchTargets(),
      RESTApi.fetchServices(),
    ]);

    const { site_id, site_name, namespace } =
      data.sites.find(({ site_id: id }) => {
        return id === siteId;
      }) || data.sites[0];

    return {
      data,
      siteInfo: {
        links,
        targets,
        services: normalizeServices(targets, services),
        siteId: site_id,
        siteName: site_name,
        namespace,
      },
    };
  },
};

function normalizeServices(targets: TargetsResponse[], services: ServicesResponse[]): Service[] {
  const servicesNormalized: Service[] = [];

  services.forEach((service) => {
    const serviceTarget = targets.find(({ name }) => {
      return name === service.name;
    });

    if (!serviceTarget) {
      servicesNormalized.push(service);

      return;
    }

    targets.forEach(({ name, type, ports }) => {
      const endpoint = service?.endpoints?.find(({ target }) => {
        return target === name;
      });

      if (service && endpoint) {
        servicesNormalized.push({ ...service, type, exposed: true, ports });
      } else {
        servicesNormalized.push({ type, name, exposed: false });
      }
    });
  });

  return servicesNormalized;
}
