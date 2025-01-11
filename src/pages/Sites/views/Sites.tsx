import { BIG_PAGINATION_SIZE } from '../../../config/app';
import { Labels } from '../../../config/labels';
import { getTestsIds } from '../../../config/testIds';
import SkTable from '../../../core/components/SkTable';
import MainContainer from '../../../layout/MainContainer';
import { TopologyRoutesPaths, TopologyViews } from '../../Topology/Topology.enum';
import { useSitesData } from '../hooks/useSitesData';
import { customSiteCells, siteColumns } from '../Sites.constants';

const Sites = function () {
  const { sites } = useSitesData();

  return (
    <MainContainer
      dataTestId={getTestsIds.sitesView()}
      title={Labels.Sites}
      description={Labels.SiteDescription}
      link={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.Sites}`}
      mainContentChildren={
        <SkTable
          columns={siteColumns}
          rows={sites}
          paginationPageSize={BIG_PAGINATION_SIZE}
          pagination={true}
          customCells={customSiteCells}
        />
      }
    />
  );
};

export default Sites;
