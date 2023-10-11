import { SiteResponse } from '@API/REST.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';
import { timeAgo } from '@core/utils/timeAgo';

import { SiteLabels, SitesRoutesPaths } from './Sites.enum';

export const SitesPaths = {
  path: SitesRoutesPaths.Sites,
  name: SiteLabels.Section
};

export const siteColumns: SKColumn<SiteResponse>[] = [
  {
    name: SiteLabels.Name,
    prop: 'name' as keyof SiteResponse,
    customCellName: 'LinkCell'
  },

  {
    name: SiteLabels.Namespace,
    prop: 'nameSpace' as keyof SiteResponse
  },
  {
    name: SiteLabels.SiteVersion,
    prop: 'siteVersion' as keyof SiteResponse,
    width: 15
  },
  {
    name: SiteLabels.Created,
    prop: 'startTime' as keyof SiteResponse,
    format: timeAgo,
    width: 15
  }
];
