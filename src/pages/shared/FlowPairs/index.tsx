import { FC, useCallback, useState } from 'react';

import { Modal, ModalVariant } from '@patternfly/react-core';

import { FlowPairsResponse } from '@API/REST.interfaces';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import { SKTableProps } from '@core/components/SkTable/SkTable.interfaces';
import ViewDetailCell from '@core/components/ViewDetailsCell';

import FlowPair from './FlowPair';
import { flowPairsComponentsTable } from './FlowPair.constants';

const FlowPairs: FC<SKTableProps<FlowPairsResponse>> = function ({ ...props }) {
  const [flowPairSelected, setFlowPairIdSelected] = useState<FlowPairsResponse>();

  const handleOnClickDetails = useCallback((flowPair?: FlowPairsResponse) => {
    setFlowPairIdSelected(flowPair);
  }, []);

  return (
    <>
      <SkTable
        {...props}
        customCells={{
          ...flowPairsComponentsTable,
          viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
            <ViewDetailCell onClick={handleOnClickDetails} value={data} />
          )
        }}
      />
      <Modal
        title={'Details'}
        isOpen={!!flowPairSelected}
        onClose={() => handleOnClickDetails(undefined)}
        variant={ModalVariant.medium}
      >
        {flowPairSelected ? <FlowPair flowPair={flowPairSelected} /> : null}
      </Modal>
    </>
  );
};

export default FlowPairs;
