import { Brand, Grid, GridItem, Text, TextContent, TextVariants } from '@patternfly/react-core';

import BrandImg from '@assets/skupper.svg';

import { Labels } from './NotFound.enum';

const NotFound = function () {
  return (
    <Grid data-testid="sk-not-found-view" className=" pf-u-p-4xl">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center pf-u-mb-4xl">
          <Text component={TextVariants.h1}>{Labels.ErrorServerTitle}</Text>
        </TextContent>
        <TextContent>
          <Text component={TextVariants.p}>{Labels.ErrorServerMessage}</Text>
        </TextContent>
      </GridItem>
      <GridItem span={6} className=" pf-u-p-2xl">
        <Brand src={BrandImg} alt="skupper brand" />
        <TextContent>
          <Text>{Labels.ErrorBrandMessage}</Text>
        </TextContent>
      </GridItem>
    </Grid>
  );
};

export default NotFound;
