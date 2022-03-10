import React, { memo } from 'react';

// eslint-disable-next-line import/no-unresolved
import { TextContent, Text, TextVariants, Grid, GridItem, Brand } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';

import BrandImg from '../../assets/skupper.svg';
import { TEXT_CONTENT, TITLE } from './Loading.constant';

import './Loading.scss';

function PleaseWait() {
  return (
    <div className="pf-u-text-align-center pf-u-mt-3xl">
      <div className="cog-wrapper">
        <CogIcon
          className="cog cog-main spinning-clockwise"
          color="var(--pf-global--palette--black-400)"
        />
        <CogIcon
          className="cog cog-secondary cog-upper spinning-clockwise--reverse"
          color="var(--pf-global--palette--black-400)"
        />
        <CogIcon
          className="cog cog-secondary cog-lower spinning-clockwise--reverse"
          color="var(--pf-global--palette--black-400)"
        />
      </div>
      <TextContent>
        <Text component={TextVariants.h3}>Fetching data</Text>
      </TextContent>
      <TextContent>
        <Text className="pf-u-mt-xl" component={TextVariants.p}>
          The data for the service network is being retrieved. One moment please...
        </Text>
      </TextContent>
    </div>
  );
}

const LoadingPage = memo(() => {
  return (
    <Grid className=" pf-u-p-4xl sk-loading-page">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center">
          <Text component={TextVariants.h1}>{TITLE}</Text>
        </TextContent>
        <PleaseWait />
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

export default LoadingPage;
