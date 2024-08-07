import { SiteResponse } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { SiteLabels, SitesRoutesPaths } from './Sites.enum';

export const SitesPaths = {
  path: SitesRoutesPaths.Sites,
  name: SiteLabels.Section
};

export const siteColumns: SKTableColumn<SiteResponse>[] = [
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
    name: SiteLabels.Platform,
    prop: 'platform' as keyof SiteResponse
  },
  {
    name: SiteLabels.SiteVersion,
    prop: 'siteVersion' as keyof SiteResponse,
    width: 15
  },
  {
    name: SiteLabels.Created,
    prop: 'startTime' as keyof SiteResponse,
    customCellName: 'TimestampCell',
    width: 15
  }
];
