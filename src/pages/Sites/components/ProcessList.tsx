import { FC } from 'react';

import SkTable from '../../../core/components/SkTable';
import { setColumnVisibility } from '../../../core/components/SkTable/SkTable.utils';
import { SiteResponse } from '../../../types/REST.interfaces';
import { CustomProcessCells, processesTableColumns } from '../../Processes/Processes.constants';
import { useSiteProcessListData } from '../hooks/useSiteProcessListData';

interface ProcessListProps {
  site: SiteResponse;
}

const ProcessList: FC<ProcessListProps> = function ({ site: { identity: id } }) {
  const { processes } = useSiteProcessListData(id);

  return (
    <SkTable
      columns={setColumnVisibility(processesTableColumns, { siteName: false })}
      rows={processes}
      customCells={{
        linkCell: CustomProcessCells.linkCell,
        linkComponentCell: CustomProcessCells.linkComponentCell,
        TimestampCell: CustomProcessCells.TimestampCell
      }}
    />
  );
};

export default ProcessList;
