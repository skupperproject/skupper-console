import SitesController from '../../../src/pages/Sites/services';
import { RouterLinkResponse, SiteResponse } from '../../../src/types/REST.interfaces';

describe('SitesController', () => {
  const emptySites: SiteResponse[] = [];
  const emptyLinks: RouterLinkResponse[] = [];

  it('should return an empty array if sites input is empty', () => {
    const result = SitesController.bindLinksWithSiteIds(emptySites, []);
    expect(result).toEqual([]);
  });

  it('should return an empty array if links input is empty', () => {
    const result = SitesController.bindLinksWithSiteIds([], emptyLinks);
    expect(result).toEqual([]);
  });

  it('should return an empty array if routers input is empty', () => {
    const result = SitesController.bindLinksWithSiteIds([], []);
    expect(result).toEqual([]);
  });

  it('should return an empty array if all inputs are empty', () => {
    const result = SitesController.bindLinksWithSiteIds(emptySites, emptyLinks);
    expect(result).toEqual([]);
  });
});
