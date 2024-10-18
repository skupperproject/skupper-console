import { BIG_PAGINATION_SIZE } from '../../../config/config';
import { getTestsIds } from '../../../config/testIds';
import SkTable from '../../../core/components/SkTable';
import SkSearchFilter from '../../../core/components/SkTable/SkSearchFilter';
import MainContainer from '../../../layout/MainContainer';
import { TopologyRoutesPaths, TopologyViews } from '../../Topology/Topology.enum';
import { useProcessesData } from '../hooks/useProcessesData';
import { CustomProcessCells, processesSelectOptions, processesTableColumns } from '../Processes.constants';
import { ProcessesLabels } from '../Processes.enum';

const Processes = function () {
  const {
    processes,
    summary: { processCount },
    handleGetFilters
  } = useProcessesData();

  return (
    <MainContainer
      dataTestId={getTestsIds.processesView()}
      title={ProcessesLabels.Section}
      description={ProcessesLabels.Description}
      link={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.Processes}`}
      mainContentChildren={
        <>
          <SkSearchFilter onSearch={handleGetFilters} selectOptions={processesSelectOptions} />

          <SkTable
            columns={processesTableColumns}
            rows={processes}
            customCells={CustomProcessCells}
            pagination={true}
            paginationTotalRows={processCount}
            paginationPageSize={BIG_PAGINATION_SIZE}
            onGetFilters={handleGetFilters}
          />
        </>
      }
    />
  );
};

export default Processes;
