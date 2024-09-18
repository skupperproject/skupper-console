import { FC } from 'react';

import SkTable from '@core/components/SkTable';
import { setColumnVisibility } from '@core/components/SkTable/SkTable.utils';
import { CustomProcessCells, processesTableColumns } from '@pages/Processes/Processes.constants';

import { useServersData } from '../hooks/useServersData';

interface ProcessServerListProps {
  id: string;
}

const ProcessServerList: FC<ProcessServerListProps> = function ({ id }) {
  const { processes } = useServersData(id);

  return (
    <SkTable
      columns={setColumnVisibility(processesTableColumns, { processBinding: false })}
      rows={processes}
      customCells={{
        linkCell: CustomProcessCells.linkCell,
        linkCellSite: CustomProcessCells.linkCellSite,
        linkComponentCell: CustomProcessCells.linkComponentCell,
        TimestampCell: CustomProcessCells.TimestampCell,
        ExposureCell: CustomProcessCells.ExposureCell
      }}
    />
  );
};

export default ProcessServerList;
