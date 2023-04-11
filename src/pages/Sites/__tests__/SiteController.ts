import { LinkResponse, RouterResponse, SiteResponse } from '@API/REST.interfaces';
import mockLinks from '@mocks/data/LINKS.json';
import mockRouters from '@mocks/data/ROUTERS.json';
import mockSites from '@mocks/data/SITES.json';

import SitesController from '../services';

describe('SitesController', () => {
  describe('bindLinksWithSiteIds', () => {
    const emptySites: SiteResponse[] = [];
    const emptyLinks: LinkResponse[] = [];
    const emptyRouters: RouterResponse[] = [];

    it('should return an empty array if sites input is empty', () => {
      const result = SitesController.bindLinksWithSiteIds(emptySites, [], []);
      expect(result).toEqual([]);
    });

    it('should return an empty array if links input is empty', () => {
      const result = SitesController.bindLinksWithSiteIds([], emptyLinks, []);
      expect(result).toEqual([]);
    });

    it('should return an empty array if routers input is empty', () => {
      const result = SitesController.bindLinksWithSiteIds([], [], emptyRouters);
      expect(result).toEqual([]);
    });

    it('should return an empty array if all inputs are empty', () => {
      const result = SitesController.bindLinksWithSiteIds(emptySites, emptyLinks, emptyRouters);
      expect(result).toEqual([]);
    });

    it('should handle the case where the link name is undefined', () => {
      const sites = mockSites.results;
      const links = mockLinks.results as LinkResponse[];
      const routers = mockRouters.results;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const linksWithoutName = links.map(({ name, ...rest }) => rest);
      const result = SitesController.bindLinksWithSiteIds(sites, linksWithoutName, routers);

      expect(result[0]).toEqual({ ...sites[0], targetIds: [] });
    });
  });
});
