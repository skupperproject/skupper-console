import { FC, useCallback, useState } from 'react';

import { Modal, ModalVariant } from '@patternfly/react-core';

import { FlowPairsResponse } from '@API/REST.interfaces';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import { SKTableProps } from '@core/components/SkTable/SkTable.interfaces';
import ViewDetailCell from '@core/components/ViewDetailsCell';

import FlowPair from './FlowPair';
import { flowPairsComponentsTable } from './FlowPair.constants';

const FlowPairsTable: FC<SKTableProps<FlowPairsResponse>> = function ({ ...props }) {
  const [flowPairIdSelected, setFlowPairIdSelected] = useState<string>();

  const handleOnClickDetails = useCallback((id?: string) => {
    setFlowPairIdSelected(id);
  }, []);

  return (
    <>
      <SkTable
        {...props}
        customCells={{
          ...flowPairsComponentsTable,
          viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
            <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
          )
        }}
      />
      <Modal
        title={'Details'}
        isOpen={!!flowPairIdSelected}
        onClose={() => handleOnClickDetails(undefined)}
        variant={ModalVariant.medium}
      >
        {flowPairIdSelected ? <FlowPair flowPairId={flowPairIdSelected} /> : <div />}
      </Modal>
    </>
  );
};

export default FlowPairsTable;
