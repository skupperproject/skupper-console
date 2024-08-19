import { FC, useCallback, useState } from 'react';

import { Modal, ModalVariant } from '@patternfly/react-core';

import { SkLinkCellProps } from '@core/components/SkLinkCell';
import SkTable, { SKTableProps } from '@core/components/SkTable';
import SkViewDetailCell from '@core/components/SkViewDetailsCell';
import { FlowPairsResponse } from '@sk-types/REST.interfaces';

import FlowPair from './FlowPair';
import { flowPairsComponentsTable } from './FlowPair.constants';

const SkFlowPairsTable: FC<SKTableProps<FlowPairsResponse>> = function ({ ...props }) {
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
          viewDetailsLinkCell: ({ data }: SkLinkCellProps<FlowPairsResponse>) => (
            <SkViewDetailCell onClick={handleOnClickDetails} value={data} />
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

export default SkFlowPairsTable;
