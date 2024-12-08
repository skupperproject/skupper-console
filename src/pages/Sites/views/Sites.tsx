import { BIG_PAGINATION_SIZE } from '../../../config/app';
import { getTestsIds } from '../../../config/testIds';
import SkTable from '../../../core/components/SkTable';
import MainContainer from '../../../layout/MainContainer';
import { TopologyRoutesPaths, TopologyViews } from '../../Topology/Topology.enum';
import { useSitesData } from '../hooks/useSitesData';
import { customSiteCells, siteColumns } from '../Sites.constants';
import { SiteLabels } from '../Sites.enum';

const Sites = function () {
  const { sites } = useSitesData();

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
          pagination={true}
          customCells={customSiteCells}
        />
      }
    />
  );
};

export default Sites;
