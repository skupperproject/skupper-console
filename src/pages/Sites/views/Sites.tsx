import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { SiteResponse } from '@API/REST.interfaces';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';

import { siteColumns } from '../Sites.constants';
import { SiteLabels, SitesRoutesPaths, QueriesSites } from '../Sites.enum';

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
          customCells={{
            LinkCell: (props: LinkCellProps<SiteResponse>) =>
              LinkCell({
                ...props,
                type: 'site',
                link: `${SitesRoutesPaths.Sites}/${props.data.name}@${props.data.identity}`
              })
          }}
        />
      }
    />
  );
};

export default Sites;
