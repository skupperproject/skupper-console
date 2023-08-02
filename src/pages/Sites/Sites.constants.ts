import { SiteResponse } from '@API/REST.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';
import { timeAgo } from '@core/utils/timeAgo';

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
  },

  {
    name: Labels.Namespace,
    prop: 'nameSpace' as keyof SiteResponse
  },
  {
    name: Labels.SiteVersion,
    prop: 'siteVersion' as keyof SiteResponse,
    width: 15
  },
  {
    name: Labels.Created,
    prop: 'startTime' as keyof SiteResponse,
    format: timeAgo,
    width: 15
  }
];

export const LINK_DIRECTIONS = {
  OUTGOING: 'outgoing',
  INCOMING: 'incoming'
};
