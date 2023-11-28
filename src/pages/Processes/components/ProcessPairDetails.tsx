import { FC } from 'react';

import { Bullseye, Grid, GridItem, Icon } from '@patternfly/react-core';
import { LongArrowAltRightIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { ProcessResponse } from '@API/REST.interfaces';
import { VarColors } from '@config/colors';
import LinkCell from '@core/components/LinkCell';

import Details from './Details';
import { ProcessesRoutesPaths, QueriesProcesses } from '../Processes.enum';
import { ProcessPairProcessesProps } from '../Processes.interfaces';

const ProcessPairDetails: FC<ProcessPairProcessesProps> = function ({ sourceId, destinationId }) {
  const { data: source } = useQuery({
    queryKey: [QueriesProcesses.GetProcess, sourceId],
    queryFn: () => RESTApi.fetchProcess(sourceId)
  });

  const { data: destination } = useQuery({
    queryKey: [QueriesProcesses.GetDestination, destinationId],
    queryFn: () => RESTApi.fetchProcess(destinationId)
  });

  if (!source || !destination) {
    return null;
  }

  return (
    <Grid hasGutter>
      <GridItem sm={12} md={5}>
        <Details
          process={source}
          title={LinkCell<ProcessResponse>({
            data: source,
            value: source.name,
            link: `${ProcessesRoutesPaths.Processes}/${source.name}@${sourceId}`
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
          title={LinkCell<ProcessResponse>({
            data: destination,
            value: destination.name,
            link: `${ProcessesRoutesPaths.Processes}/${destination.name}@${destinationId}`
          })}
        />
      </GridItem>
    </Grid>
  );
};

export default ProcessPairDetails;
