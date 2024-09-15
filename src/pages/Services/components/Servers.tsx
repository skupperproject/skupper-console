import { FC } from 'react';

import { BIG_PAGINATION_SIZE } from '@config/config';
import SkTable from '@core/components/SkTable';
import { CustomProcessCells } from '@pages/Processes/Processes.constants';

import { useServersData } from '../hooks/useServersData';
import { tcpServerColumns } from '../Services.constants';

interface ServersProps {
  id: string;
}

const Servers: FC<ServersProps> = function ({ id }) {
  const { servers } = useServersData(id);

  return (
    <SkTable
      columns={tcpServerColumns}
      rows={servers}
      pagination={true}
      paginationPageSize={BIG_PAGINATION_SIZE}
      customCells={CustomProcessCells}
    />
  );
};

export default Servers;
