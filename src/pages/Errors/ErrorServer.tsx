import React from 'react';

import { Brand, Grid, GridItem, Text, TextContent, TextVariants } from '@patternfly/react-core';

import BrandImg from '@assets/skupper.svg';

import { Labels } from '../../App.enum';

const ErrorServer = function () {
  return (
    <Grid className=" pf-u-p-4xl">
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
          <Text>{Labels.LoadingBrandMessage}</Text>
        </TextContent>
      </GridItem>
    </Grid>
  );
};

export default ErrorServer;
