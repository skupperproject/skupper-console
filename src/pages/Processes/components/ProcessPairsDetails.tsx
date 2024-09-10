import { FC } from 'react';

import { Bullseye, Grid, GridItem, Icon } from '@patternfly/react-core';
import { LongArrowAltRightIcon } from '@patternfly/react-icons';

import { VarColors } from '@config/colors';
import SkLinkCell from '@core/components/SkLinkCell';
import { ProcessResponse } from '@sk-types/REST.interfaces';

import Details from './Details';
import { ProcessesRoutesPaths } from '../Processes.enum';

interface ProcessPairsDetailsProps {
  source: ProcessResponse;
  destination: ProcessResponse;
}

const ProcessPairsDetails: FC<ProcessPairsDetailsProps> = function ({ source, destination }) {
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
