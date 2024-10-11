import SkEndTimeCell from '@core/components/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import SkLinkStatusCell from '@core/components/SkLinkStatusCell';
import SkValueOrPlaceHolderCell from '@core/components/SkValueOrPlacholderCell';
import { CustomPairMetricCells } from '@pages/Processes/Processes.constants';
import { PairsResponse, RouterLinkResponse, SiteResponse } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { SiteLabels, SitesRoutesPaths } from './Sites.enum';

export const SitesPaths = {
  path: SitesRoutesPaths.Sites,
  name: SiteLabels.Section
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
  isHACell: (props: SkLinkCellProps<RouterLinkResponse>) => (Number(props.value) > 1 ? SiteLabels.YES : SiteLabels.NO),
  SkStatusLinkCell: SkLinkStatusCell,
  SkValueOrPlaceHolderCell
};

export const CustomSitePairCells = {
  ...CustomPairMetricCells,
  ConnectedLinkCell: (props: SkLinkCellProps<PairsResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.destinationName}@${props.data.destinationId}?type=${SiteLabels.Pairs}`
    })
};

export const siteColumns: SKTableColumn<SiteResponse>[] = [
  {
    name: SiteLabels.Name,
    prop: 'name',
    customCellName: 'LinkCell'
  },

  {
    name: SiteLabels.Namespace,
    prop: 'nameSpace'
  },
  {
    name: SiteLabels.Platform,
    prop: 'platform'
  },

  {
    name: SiteLabels.SiteVersion,
    prop: 'siteVersion',
    width: 15
  },
  {
    name: SiteLabels.HA,
    prop: 'routerCount',
    customCellName: 'isHACell',
    modifier: 'fitContent'
  },
  {
    name: SiteLabels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent',
    width: 15
  }
];

export const linksColumns: SKTableColumn<RouterLinkResponse>[] = [
  {
    name: SiteLabels.Name,
    prop: 'name'
  },
  {
    name: SiteLabels.TargetSite,
    prop: 'destinationSiteName',
    customCellName: 'LinkToCell'
  },
  {
    name: SiteLabels.Cost,
    prop: 'cost',
    customCellName: 'SkValueOrPlaceHolderCell'
  },
  {
    name: SiteLabels.LinkStatus,
    prop: 'status',
    customCellName: 'SkStatusLinkCell'
  },

  {
    name: SiteLabels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    width: 15
  }
];

export const linksRemoteColumns: SKTableColumn<RouterLinkResponse>[] = [
  linksColumns[0],
  {
    name: SiteLabels.SourceSite,
    prop: 'sourceSiteName',
    customCellName: 'LinkFromCell'
  },
  linksColumns[2],
  linksColumns[3],
  linksColumns[4]
];
