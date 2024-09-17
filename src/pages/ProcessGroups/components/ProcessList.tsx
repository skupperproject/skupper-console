import { FC } from 'react';

import SkTable from '@core/components/SkTable';
import { setColumnVisibility } from '@core/components/SkTable/SkTable.utils';
import { CustomProcessCells, processesTableColumns } from '@pages/Processes/Processes.constants';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';
import { ProcessResponse } from '@sk-types/REST.interfaces';

interface ProcessListProps {
  processes: ProcessResponse[];
}

const ProcessList: FC<ProcessListProps> = function ({ processes }) {
  return (
    <SkTable
      title={ProcessesLabels.Section}
      columns={setColumnVisibility(processesTableColumns, { groupName: false })}
      rows={processes}
      customCells={{
        linkCell: CustomProcessCells.linkCell,
        linkCellSite: CustomProcessCells.linkCellSite,
        TimestampCell: CustomProcessCells.TimestampCell,
        ExposureCell: CustomProcessCells.ExposureCell
      }}
    />
  );
};

export default ProcessList;
