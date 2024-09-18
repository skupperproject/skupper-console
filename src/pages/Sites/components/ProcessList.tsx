import { FC } from 'react';

import SkTable from '@core/components/SkTable';
import { setColumnVisibility } from '@core/components/SkTable/SkTable.utils';
import { CustomProcessCells, processesTableColumns } from '@pages/Processes/Processes.constants';
import { SiteResponse } from '@sk-types/REST.interfaces';

import { useSiteProcessListData } from '../hooks/useSiteProcessListData';

interface ProcessListProps {
  site: SiteResponse;
}

const ProcessList: FC<ProcessListProps> = function ({ site: { identity: id } }) {
  const { processes } = useSiteProcessListData(id);

  return (
    <SkTable
      columns={setColumnVisibility(processesTableColumns, { parentName: false })}
      rows={processes}
      customCells={{
        linkCell: CustomProcessCells.linkCell,
        linkComponentCell: CustomProcessCells.linkComponentCell,
        TimestampCell: CustomProcessCells.TimestampCell,
        ExposureCell: CustomProcessCells.ExposureCell
      }}
    />
  );
};

export default ProcessList;
