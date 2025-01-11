import { useCallback, useState } from 'react';

import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';

import { customCells } from './BiFlowList.constants';
import { BiFlowResponse } from '../../../types/REST.interfaces';
import SkBiFlowDetails from '../SkBiFlowDetails';
import { SkLinkCellProps } from '../SkLinkCell';
import SkTable, { SKTableProps } from '../SkTable';
import SkViewDetailCell from '../SkViewDetailsCell';

type SkBiFlowListProps<T extends BiFlowResponse> = SKTableProps<T>;

const SkBiFlowList = function <T extends BiFlowResponse>({ ...props }: SkBiFlowListProps<T>) {
  const [biFlowSelected, setBiflowSelected] = useState<T>();

  const handleOnClickDetails = useCallback((biflow?: T) => {
    setBiflowSelected(biflow);
  }, []);

  return (
    <>
      <SkTable
        {...props}
        customCells={{
          ...customCells,
          viewDetailsLinkCell: ({ data }: SkLinkCellProps<T>) => (
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
