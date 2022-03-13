import React, { memo } from 'react';

import {
  Brand,
  Grid,
  GridItem,
  TextContent,
  Text,
  TextVariants,
  List,
  ListItem,
  Button,
} from '@patternfly/react-core';

import BrandImg from '../assets/skupper.svg';
import { TEXT_CONTENT } from './Loading/Loading.constant';

const ERR_CONNECTION_TITLE = 'Connection error';

const ErrorConnection = memo(() => {
  return (
    <Grid className=" pf-u-p-4xl">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center pf-u-mb-4xl">
          <Text component={TextVariants.h1}>{ERR_CONNECTION_TITLE}</Text>
        </TextContent>
        <TextContent>
          <Text component={TextVariants.p}>Here are some things to try:</Text>
        </TextContent>
        <List>
          <ListItem>
            <Button id="sk-try-again" variant="primary">
              Try again
            </Button>
          </ListItem>
          <ListItem>
            To help diagnose the problem
            <pre>{`curl ${window.location.protocol}//${window.location.host}/DATA`}</pre>
            and report the results to the skupper support site.
          </ListItem>
        </List>
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

export default ErrorConnection;
