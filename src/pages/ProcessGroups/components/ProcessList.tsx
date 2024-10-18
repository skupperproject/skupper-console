import { FC } from 'react';

import SkTable from '../../../core/components/SkTable';
import { setColumnVisibility } from '../../../core/components/SkTable/SkTable.utils';
import { ProcessResponse } from '../../../types/REST.interfaces';
import { CustomProcessCells, processesTableColumns } from '../../Processes/Processes.constants';

interface ProcessListProps {
  processes: ProcessResponse[];
}

const ProcessList: FC<ProcessListProps> = function ({ processes }) {
  return (
    <SkTable
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
