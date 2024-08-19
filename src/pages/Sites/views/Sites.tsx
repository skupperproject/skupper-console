import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds';
import SkEndTimeCell from '@core/components/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import SkTable from '@core/components/SkTable';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';
import { SiteResponse } from '@sk-types/REST.interfaces';

import { siteColumns } from '../Sites.constants';
import { SiteLabels, SitesRoutesPaths, QueriesSites } from '../Sites.enum';

const customCells = {
  TimestampCell: SkEndTimeCell,
  LinkCell: (props: SkLinkCellProps<SiteResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.name}@${props.data.identity}`
    })
};

const Sites = function () {
  const { data: sites } = useSuspenseQuery({
    queryKey: [QueriesSites.GetSites],
    queryFn: () => RESTApi.fetchSites(),
    refetchInterval: UPDATE_INTERVAL
  });

  return (
    <MainContainer
      dataTestId={getTestsIds.sitesView()}
      title={SiteLabels.Section}
      description={SiteLabels.Description}
      link={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.Sites}`}
      mainContentChildren={
        <SkTable
          columns={siteColumns}
          rows={sites}
          paginationPageSize={BIG_PAGINATION_SIZE}
          customCells={customCells}
        />
      }
    />
  );
};

export default Sites;
