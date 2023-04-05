import React from 'react';

import { Brand, Grid, GridItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useLocation } from 'react-router-dom';

import BrandImg from '@assets/skupper.svg';

import { Labels } from './Server.enum';

const ErrorServer = function () {
  const { state } = useLocation();

  return (
    <Grid className=" pf-u-p-4xl">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center pf-u-mb-4xl">
          <Text component={TextVariants.h1}>
            {Labels.ErrorServerTitle} {state?.httpStatus}
          </Text>
        </TextContent>
        <TextContent>
          <Text component={TextVariants.h4}>{state?.httpStatus ? '' : Labels.GenericErrorServerMessage}</Text>
        </TextContent>
      </GridItem>
      <GridItem span={6} className=" pf-u-p-2xl">
        <Brand src={BrandImg} alt="skupper brand" />
        <TextContent>
          <Text>{Labels.Description}</Text>
        </TextContent>
      </GridItem>
    </Grid>
  );
};

export default ErrorServer;
