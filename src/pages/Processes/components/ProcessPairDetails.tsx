import { FC } from 'react';

import { Bullseye, Grid, GridItem, Icon } from '@patternfly/react-core';
import { LongArrowAltRightIcon } from '@patternfly/react-icons';

import Details from './Details';
import { styles } from '../../../config/styles';
import SkLinkCell from '../../../core/components/SkLinkCell';
import { ProcessResponse } from '../../../types/REST.interfaces';
import { ProcessesRoutesPaths } from '../Processes.enum';

interface ProcessPairDetailsProps {
  source: ProcessResponse;
  destination: ProcessResponse;
}

const ProcessPairDetails: FC<ProcessPairDetailsProps> = function ({ source, destination }) {
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
          <Icon size="2xl">
            <LongArrowAltRightIcon color={styles.default.darkBackgroundColor} />
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

export default ProcessPairDetails;
