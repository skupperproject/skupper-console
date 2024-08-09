import { FC } from 'react';

import { Bullseye, Grid, GridItem, Icon } from '@patternfly/react-core';
import { LongArrowAltRightIcon } from '@patternfly/react-icons';
import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { VarColors } from '@config/colors';
import SkLinkCell from '@core/components/SkLinkCell';
import { ProcessResponse } from '@sk-types/REST.interfaces';

import Details from './Details';
import { ProcessesRoutesPaths, QueriesProcesses } from '../Processes.enum';

interface ProcessPairsDetailsProps {
  sourceId: string;
  destinationId: string;
}

const ProcessPairsDetails: FC<ProcessPairsDetailsProps> = function ({ sourceId, destinationId }) {
  const { source, destination } = useFetchProcessPairDetails({ sourceId, destinationId });

  return (
    <Grid hasGutter>
      <GridItem sm={12} md={5}>
        <Details
          process={source}
          title={SkLinkCell<ProcessResponse>({
            data: source,
            value: source.name,
            link: `${ProcessesRoutesPaths.Processes}/${source.name}@${source.identity}`
          })}
        />
      </GridItem>

      <GridItem sm={12} md={2}>
        <Bullseye>
          <Icon size="xl">
            <LongArrowAltRightIcon color={VarColors.Black500} />
          </Icon>
        </Bullseye>
      </GridItem>

      <GridItem sm={12} md={5}>
        <Details
          process={destination}
          title={SkLinkCell<ProcessResponse>({
            data: destination,
            value: destination.name,
            link: `${ProcessesRoutesPaths.Processes}/${destination.name}@${destination.identity}`
          })}
        />
      </GridItem>
    </Grid>
  );
};

export default ProcessPairsDetails;

interface ProcessPairsDetailsDataProps {
  source: ProcessResponse;
  destination: ProcessResponse;
}

const useFetchProcessPairDetails = ({
  sourceId,
  destinationId
}: ProcessPairsDetailsProps): ProcessPairsDetailsDataProps => {
  const [{ data: source }, { data: destination }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcess, sourceId],
        queryFn: () => RESTApi.fetchProcess(sourceId)
      },
      {
        queryKey: [QueriesProcesses.GetDestination, destinationId],
        queryFn: () => RESTApi.fetchProcess(destinationId)
      }
    ]
  });

  return { source, destination };
};
