import { Brand, Grid, GridItem, Text, TextContent, TextVariants } from '@patternfly/react-core';

import { brandImg } from '@config/config';

import { Labels } from './NotFound.enum';
import { ErrorLabels } from '../Errors.enum';

const NotFound = function () {
  return (
    <Grid data-testid="sk-not-found-view" className=" pf-u-p-4xl">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center pf-u-mb-4xl">
          <Text component={TextVariants.h1}>{Labels.ErrorTitle}</Text>
        </TextContent>
      </GridItem>
      <GridItem span={6} className=" pf-u-p-2xl">
        <Brand src={brandImg} alt="brand" />
        <TextContent>
          <Text>{ErrorLabels.Description}</Text>
        </TextContent>
      </GridItem>
    </Grid>
  );
};

export default NotFound;
