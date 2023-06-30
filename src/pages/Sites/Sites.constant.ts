import { SiteResponse } from '@API/REST.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interface';

import { Labels, SitesRoutesPaths } from './Sites.enum';

export const SitesPaths = {
  path: SitesRoutesPaths.Sites,
  name: Labels.Section
};

export const siteColumns: SKColumn<SiteResponse>[] = [
  {
    name: Labels.Name,
    prop: 'name' as keyof SiteResponse,
    customCellName: 'linkCell'
  }
];

export const LINK_DIRECTIONS = {
  OUTGOING: 'outgoing',
  INCOMING: 'incoming'
};
