import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';

import { Labels } from '../../../config/labels';
import { getTestsIds } from '../../../config/testIds';
import { getIdAndNameFromUrlParams } from '../../../core/utils/getIdAndNameFromUrlParams';
import MainContainer from '../../../layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '../../Topology/Topology.enum';
import BiFlowList from '../components/BiFlowList';
import PairDetails from '../components/PairDetails';
import { useProcessPairData } from '../hooks/useProcessPairData';

export interface ProcessPairProps {
  id: string;
}

export const ProcessPairContent: FC<ProcessPairProps> = function ({ id }) {
  const { source, destination } = useProcessPairData({ id });

  return (
    <MainContainer
      dataTestId={getTestsIds.processPairsView(id)}
      title={Labels.Details}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.IdSelected}=${id}`}
      mainContentChildren={
        <Stack hasGutter>
          <StackItem>
            <PairDetails source={source} destination={destination} />
          </StackItem>

          <StackItem isFilled>
            <BiFlowList sourceProcessId={source.identity} destProcessId={destination.identity} />
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
