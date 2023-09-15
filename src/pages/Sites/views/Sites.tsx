import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';
import { SiteResponse } from 'API/REST.interfaces';

import { siteColumns } from '../Sites.constants';
import { Labels, SitesRoutesPaths, QueriesSites } from '../Sites.enum';

const Sites = function () {
  const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites());

  return (
    <MainContainer
      dataTestId={getTestsIds.sitesView()}
      title={Labels.Section}
      description={Labels.Description}
      link={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.Sites}`}
      mainContentChildren={
        <SkTable
          columns={siteColumns}
          rows={sites}
          paginationPageSize={BIG_PAGINATION_SIZE}
          customCells={{
            linkCell: (props: LinkCellProps<SiteResponse>) =>
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
