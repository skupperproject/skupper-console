import React from 'react';

import { Brand, Grid, GridItem, TextContent, Text, TextVariants, List, ListItem, Button } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import BrandImg from '@assets/skupper.svg';

import { Labels } from './Connection.enum';

const ErrorConnection = function () {
  const navigate = useNavigate();

  const handleRetryConnection = () => {
    navigate(-1);
  };

  return (
    <Grid className=" pf-u-p-4xl">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center pf-u-mb-4xl">
          <Text component={TextVariants.h1}>{Labels.ErrorConnectionTitle}</Text>
        </TextContent>
        <TextContent>
          <Text component={TextVariants.p}>Some of the reason may be:</Text>
        </TextContent>
        <List>
          <ListItem>CORS issue</ListItem>
          <ListItem>Your browser have any ad-blockers installed</ListItem>
          <ListItem>
            <Button id="sk-try-again" variant="primary" onClick={handleRetryConnection}>
              Try again
            </Button>
          </ListItem>
        </List>
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

export default ErrorConnection;
