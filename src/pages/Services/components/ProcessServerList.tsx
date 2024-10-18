import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import PairsSankeyChart from './PairsSankeyChart';
import SkTable from '../../../core/components/SkTable';
import { setColumnVisibility } from '../../../core/components/SkTable/SkTable.utils';
import { CustomProcessCells, processesTableColumns } from '../../Processes/Processes.constants';
import { useServersData } from '../hooks/useServersData';

interface ProcessServerListProps {
  id: string;
  name: string;
}

const ProcessServerList: FC<ProcessServerListProps> = function ({ id, name }) {
  const { processes } = useServersData(id);

  return (
    <Stack hasGutter>
      <StackItem>
        <PairsSankeyChart serviceId={id} serviceName={name} />
      </StackItem>
      <StackItem>
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
      </StackItem>
    </Stack>
  );
};

export default ProcessServerList;
