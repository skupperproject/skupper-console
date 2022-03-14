import React, { memo } from 'react';

import { Brand, Grid, GridItem, Text, TextContent, TextVariants } from '@patternfly/react-core';

import BrandImg from '../assets/skupper.svg';
import { TEXT_CONTENT } from './Loading/Loading.constant';

const ERR_SERVER_TITLE = 'Server error';
const ERR_SERVER_DESCRIPTION =
  'Skupper network is adjusting to a new or removed link between sites. One moment please.';

const ErrorServer = memo(() => {
  return (
    <Grid className=" pf-u-p-4xl">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center pf-u-mb-4xl">
          <Text component={TextVariants.h1}>{ERR_SERVER_TITLE}</Text>
        </TextContent>
        <TextContent>
          <Text component={TextVariants.p}>{ERR_SERVER_DESCRIPTION}</Text>
        </TextContent>
      </GridItem>
      <GridItem span={6} className=" pf-u-p-2xl">
        <Brand src={BrandImg} alt="skupper brand" />
        <TextContent>
          <Text>{TEXT_CONTENT}</Text>
        </TextContent>
      </GridItem>
    </Grid>
  );
});

export default ErrorServer;
