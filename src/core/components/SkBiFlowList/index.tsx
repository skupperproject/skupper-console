import { FC, useCallback, useState } from 'react';

import { Modal, ModalVariant } from '@patternfly/react-core';

import { SkLinkCellProps } from '@core/components/SkLinkCell';
import SkTable, { SKTableProps } from '@core/components/SkTable';
import SkViewDetailCell from '@core/components/SkViewDetailsCell';
import { BiFlowResponse } from '@sk-types/REST.interfaces';

import { customCells } from './BiFlowList.constants';
import SkBiFlowDetails from '../SkBiFlowDetails';

const SkBiFlowList: FC<SKTableProps<BiFlowResponse>> = function ({ ...props }) {
  const [biFlowSelected, setBiflowSelected] = useState<BiFlowResponse>();

  const handleOnClickDetails = useCallback((biflow?: BiFlowResponse) => {
    setBiflowSelected(biflow);
  }, []);

  return (
    <>
      <SkTable
        {...props}
        customCells={{
          ...customCells,
          viewDetailsLinkCell: ({ data }: SkLinkCellProps<BiFlowResponse>) => (
            <SkViewDetailCell onClick={handleOnClickDetails} value={data} />
          )
        }}
      />
      <Modal
        title={'Details'}
        isOpen={!!biFlowSelected}
        onClose={() => handleOnClickDetails(undefined)}
        variant={ModalVariant.medium}
      >
        {biFlowSelected ? <SkBiFlowDetails biflow={biFlowSelected} /> : null}
      </Modal>
    </>
  );
};

export default SkBiFlowList;
