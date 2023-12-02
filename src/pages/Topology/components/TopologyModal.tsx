import { FC, Suspense, useCallback, useState } from 'react';

import { Bullseye, Button, Flex, Modal, Spinner, Text, Title } from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import TransitionSlide from '@core/components/TransitionPages/Slide';
import Details from '@pages/Processes/components/Details';
import ProcessPairs from '@pages/Processes/components/ProcessesPairs';
import ProcessPairDetails from '@pages/Processes/components/ProcessPairDetails';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import { TopologyModalProps } from '../Topology.interfaces';

const TopologyModal: FC<TopologyModalProps> = function ({ ids, items, modalType, onClose }) {
  const [index, setIndex] = useState(0);

  const handleClose = useCallback(() => {
    setIndex(0);
    onClose?.();
  }, [onClose]);

  const idsArray = ids?.split('~');
  const hasMoreElements = !!idsArray?.length && idsArray.length > 1;

  let Header = null;
  let Body = null;
  const itemsSelected = items.filter(({ identity }) => idsArray?.includes(identity));

  if (modalType === 'process') {
    const item = itemsSelected[index] as ProcessResponse;

    Header = (
      <Link
        to={`${ProcessesRoutesPaths.Processes}/${item?.name}@${item?.identity}?type=${ProcessesLabels.ProcessPairs}`}
      >
        <Title headingLevel="h1">{item?.name}</Title>
      </Link>
    );

    Body = (
      <Suspense
        fallback={
          <Bullseye>
            <Spinner />
          </Bullseye>
        }
      >
        <Details process={item as ProcessResponse} />
        <ProcessPairs process={item as ProcessResponse} />
      </Suspense>
    );
  }

  if (modalType === 'processPair') {
    const item = itemsSelected[index] as ProcessPairsResponse;

    Header = (
      <Link
        to={`${ProcessesRoutesPaths.Processes}/${item.sourceName}@${item.sourceId}/${ProcessesLabels.ProcessPairs}@${item.identity}@${item.protocol}`}
      >
        <Flex>
          <Title headingLevel="h1">{item?.sourceName}</Title>
          <Text>to</Text>
          <Title headingLevel="h1">{item.destinationName}</Title>
        </Flex>
      </Link>
    );

    Body = (
      <Suspense fallback={<Spinner />}>
        <ProcessPairDetails sourceId={item.sourceId} destinationId={item.destinationId} />
      </Suspense>
    );
  }

  return (
    <Modal
      variant="large"
      aria-label="Topology Modal"
      isOpen={!!modalType}
      onClose={handleClose}
      tabIndex={0}
      width={'100%'}
      style={{ height: '100vh' }}
      header={
        <Flex>
          {hasMoreElements && (
            <Button variant="secondary" isDisabled={index === 0} isInline onClick={() => setIndex(index - 1)}>
              prev
            </Button>
          )}
          {Header}
          {hasMoreElements && (
            <Button isDisabled={index === (idsArray?.length || 0) - 1} isInline onClick={() => setIndex(index + 1)}>
              next
            </Button>
          )}

          {hasMoreElements && <Title headingLevel="h2">{`${index + 1} of ${idsArray?.length}`}</Title>}
        </Flex>
      }
    >
      <TransitionSlide page={index}>{Body || <div />}</TransitionSlide>
    </Modal>
  );
};

export default TopologyModal;
