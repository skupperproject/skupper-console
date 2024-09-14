import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';

import { getTestsIds } from '@config/testIds';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';

import FlowPairsList from '../components/FlowPairsList';
import ProcessPairDetails from '../components/ProcessPairsDetails';
import { useProcessPairData } from '../hooks/useProcessPairsData';
import { ProcessesLabels } from '../Processes.enum';

export interface ProcessPairsProps {
  id: string;
}

export const ProcessPairsContent: FC<ProcessPairsProps> = function ({ id }) {
  const { processPairs, source, destination } = useProcessPairData({ id });

  return (
    <MainContainer
      dataTestId={getTestsIds.processPairsView(id)}
      title={ProcessesLabels.Title}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.IdSelected}=${id}`}
      mainContentChildren={
        <Stack hasGutter>
          <StackItem>
            <ProcessPairDetails source={source} destination={destination} />
          </StackItem>

          <StackItem isFilled>
            <FlowPairsList
              sourceProcessId={source.identity}
              destProcessId={destination.identity}
              protocol={processPairs.protocol}
            />
          </StackItem>
        </Stack>
      }
    />
  );
};

const ProcessPairs = function () {
  const { id: paramId } = useParams();
  const { id } = getIdAndNameFromUrlParams(paramId as string);

  return <ProcessPairsContent id={id} />;
};

export default ProcessPairs;
