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
import useProcessPairData from '../hooks/useProcessPairsData';
import { ProcessesLabels } from '../Processes.enum';

const ProcessPairs = function () {
  const { processPair } = useParams() as { processPair: string };

  const { id: processPairId, protocol } = getIdAndNameFromUrlParams(processPair);

  return <ProcessPairsContent processPairId={processPairId} protocol={protocol as AvailableProtocols} />;
};

export interface ProcessPairsContentProps {
  processPairId: string;
  protocol: AvailableProtocols | 'undefined';
}

export const ProcessPairsContent: FC<ProcessPairsContentProps> = function ({ processPairId, protocol }) {
  const { source, destination } = useProcessPairData({ processPairId });

  return (
    <MainContainer
      dataTestId={getTestsIds.processPairsView(processPairId)}
      title={ProcessesLabels.Title}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.IdSelected}=${processPairId}`}
      mainContentChildren={
        <Stack hasGutter>
          <StackItem>
            <ProcessPairDetails source={source} destination={destination} />
          </StackItem>

          <StackItem isFilled>
            <ProcessPairsFlows
              sourceProcessId={source.identity}
              destProcessId={destination.identity}
              protocol={protocol}
            />
          </StackItem>
        </Stack>
      }
    />
  );
};

export default ProcessPairs;
