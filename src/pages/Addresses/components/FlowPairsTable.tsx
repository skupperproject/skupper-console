import { FC } from 'react';

import { useParams } from 'react-router-dom';

import { DEFAULT_TABLE_PAGE_SIZE } from '@config/config';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import { flowPairsComponentsTable } from '@pages/shared/FlowPairs/FlowPairs.constant';
import { FlowPairsResponse } from 'API/REST.interfaces';

import { AddressesRoutesPaths } from '../Addresses.enum';
import { FlowPairsTableProps } from '../Addresses.interfaces';

const FlowPairsTable: FC<FlowPairsTableProps> = function ({ connections, columns, onGetFilters, rowsCount, title }) {
  const { address } = useParams();

  return (
    <SkTable
      title={title}
      columns={columns}
      rows={connections}
      pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
      onGetFilters={onGetFilters}
      rowsCount={rowsCount}
      components={{
        ...flowPairsComponentsTable,
        viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
          <ViewDetailCell link={`${AddressesRoutesPaths.Addresses}/${address}/${data.identity}`} />
        )
      }}
    />
  );
};

export default FlowPairsTable;
