import { SiteResponse } from '@API/REST.interfaces';

import { SiteLabels, SitesRoutesPaths, SitesTableColumns } from './Sites.enum';

export const SitesPaths = {
  path: SitesRoutesPaths.Sites,
  name: SiteLabels.Section
};

export const siteColumns = [
  {
    name: SitesTableColumns.Name,
    prop: 'name' as keyof SiteResponse,
    component: 'linkCell'
  }
];

export const LINK_DIRECTIONS = {
  OUTGOING: 'outgoing',
  INCOMING: 'incoming'
};
