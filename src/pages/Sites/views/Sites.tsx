import { Split, SplitItem, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { TopologyIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Fade';
import LoadingPage from '@pages/shared/Loading';
import { TopologyLabels, TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';
import { SiteResponse } from 'API/REST.interfaces';

import { QueriesSites } from '../services/services.enum';
import { siteColumns } from '../Sites.constant';
import { Labels, SitesRoutesPaths } from '../Sites.enum';

const Sites = function () {
  const { data: sites, isLoading } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites());

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!sites) {
    return null;
  }

  return (
    <TransitionPage>
      <div data-testid={getTestsIds.sitesView()}>
        <Split>
          <SplitItem isFilled>
            <SkTitle title={Labels.Section} description={Labels.Description} />
          </SplitItem>
          <SplitItem>
            <Toolbar isFullHeight>
              <ToolbarContent>
                <ToolbarGroup alignment={{ default: 'alignRight' }}>
                  <ToolbarItem>
                    <Link to={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.Sites}`}>
                      <Tooltip content={TopologyLabels.Topology}>
                        <TopologyIcon />
                      </Tooltip>
                    </Link>
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>
          </SplitItem>
        </Split>

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
      </div>
    </TransitionPage>
  );
};

export default Sites;
