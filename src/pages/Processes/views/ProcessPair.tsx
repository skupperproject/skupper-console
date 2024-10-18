import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';

import { getTestsIds } from '../../../config/testIds';
import { getIdAndNameFromUrlParams } from '../../../core/utils/getIdAndNameFromUrlParams';
import MainContainer from '../../../layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '../../Topology/Topology.enum';
import BiFlowList from '../components/ProcessBiFlowList';
import ProcessPairDetails from '../components/ProcessPairDetails';
import { useProcessPairData } from '../hooks/useProcessPairsData';
import { ProcessesLabels } from '../Processes.enum';

export interface ProcessPairProps {
  id: string;
}

export const ProcessPairContent: FC<ProcessPairProps> = function ({ id }) {
  const { processPair, source, destination } = useProcessPairData({ id });

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
            <BiFlowList
              sourceProcessId={source.identity}
              destProcessId={destination.identity}
              protocol={processPair.protocol}
            />
          </StackItem>
        </Stack>
      }
    />
  );
};

const ProcessPair = function () {
  const { id: paramId } = useParams();
  const { id } = getIdAndNameFromUrlParams(paramId as string);

  return <ProcessPairContent id={id} />;
};

export default ProcessPair;
