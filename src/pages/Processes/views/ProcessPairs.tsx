import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';

import { AvailableProtocols } from '@API/REST.enum';
import { getTestsIds } from '@config/testIds';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';

import ProcessPairDetails from '../components/ProcessPairsDetails';
import ProcessPairsFlows from '../components/ProcessPairsFlows';
import { ProcessesLabels } from '../Processes.enum';
import { ProcessPairsContentProps } from '../Processes.interfaces';

const ProcessPairs = function () {
  const { processPair } = useParams() as { processPair: string };

  const { id: processPairId, protocol } = getIdAndNameFromUrlParams(processPair);
  const ids = processPairId?.split('-to-') || [];
  const sourceId = ids[0];
  const destinationId = ids[1];

  return (
    <ProcessPairsContent
      processPairId={processPairId}
      sourceId={sourceId}
      destinationId={destinationId}
      protocol={protocol as AvailableProtocols}
    />
  );
};

export const ProcessPairsContent: FC<ProcessPairsContentProps> = function ({
  processPairId,
  sourceId,
  destinationId,
  protocol
}) {
  return (
    <MainContainer
      dataTestId={getTestsIds.processPairsView(processPairId)}
      title={ProcessesLabels.Title}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.IdSelected}=${processPairId}`}
      mainContentChildren={
        <Stack hasGutter>
          <StackItem>
            <ProcessPairDetails sourceId={sourceId} destinationId={destinationId} />
          </StackItem>

          <StackItem isFilled>
            <ProcessPairsFlows processPairId={processPairId} protocol={protocol} />
          </StackItem>
        </Stack>
      }
    />
  );
};

export default ProcessPairs;
