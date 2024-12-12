import { SKTableColumn } from 'types/SkTable.interfaces';

import { SitesRoutesPaths } from './Sites.enum';
import { Labels } from '../../config/labels';
import SkEndTimeCell from '../../core/components/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '../../core/components/SkLinkCell';
import SkLinkStatusCell from '../../core/components/SkLinkStatusCell';
import { PairsResponse, RouterLinkResponse, SiteResponse } from '../../types/REST.interfaces';

export const SitesPaths = {
  path: SitesRoutesPaths.Sites,
  name: Labels.Sites
};

export const customSiteCells = {
  TimestampCell: SkEndTimeCell,
  LinkCell: (props: SkLinkCellProps<SiteResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.name}@${props.data.identity}`
    }),
  LinkToCell: (props: SkLinkCellProps<RouterLinkResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.name}@${props.data.destinationSiteId}`
    }),
  LinkFromCell: (props: SkLinkCellProps<RouterLinkResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.name}@${props.data.sourceSiteId}`
    }),
  isHACell: (props: SkLinkCellProps<RouterLinkResponse>) => (Number(props.value) > 1 ? Labels.YES : Labels.NO),
  SkStatusLinkCell: SkLinkStatusCell
};

export const CustomSitePairCells = {
  ConnectedLinkCell: (props: SkLinkCellProps<PairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.destinationName}@${props.data.destinationId}?type=${Labels.Pairs}`
    })
};

export const siteColumns: SKTableColumn<SiteResponse>[] = [
  {
    name: Labels.Name,
    prop: 'name',
    customCellName: 'LinkCell'
  },

  {
    name: Labels.Namespace,
    prop: 'nameSpace'
  },
  {
    name: Labels.Platform,
    prop: 'platform'
  },

  {
    name: Labels.SiteVersion,
    prop: 'siteVersion'
  },
  {
    name: Labels.HA,
    prop: 'routerCount',
    customCellName: 'isHACell'
  },
  {
    name: Labels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  }
];

export const linksColumns: SKTableColumn<RouterLinkResponse>[] = [
  {
    name: Labels.Name,
    prop: 'name'
  },
  {
    name: Labels.To,
    prop: 'destinationSiteName',
    customCellName: 'LinkToCell'
  },
  {
    name: Labels.Cost,
    prop: 'cost'
  },
  {
    name: Labels.LinkStatus,
    prop: 'status',
    customCellName: 'SkStatusLinkCell'
  },

  {
    name: Labels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent'
  }
];

export const linksRemoteColumns: SKTableColumn<RouterLinkResponse>[] = [
  linksColumns[0],
  {
    name: Labels.From,
    prop: 'sourceSiteName',
    customCellName: 'LinkFromCell'
  },
  linksColumns[2],
  linksColumns[3],
  linksColumns[4]
];
