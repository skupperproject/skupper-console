import { Brand, Grid, GridItem, List, ListItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useLocation } from 'react-router-dom';

import { brandImg } from '@config/config';

import { ErrorLabels } from '../Errors.enum';

const ErrorHttp = function () {
  const { state } = useLocation();

  return (
    <Grid className=" pf-u-p-4xl">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center">
          <Text component={TextVariants.h1}>
            {state?.httpStatus} {state?.code}
          </Text>
        </TextContent>
        <TextContent className="pf-u-text-align-center pf-u-mb-2xl">
          <Text component={TextVariants.h4}>{state?.message}</Text>
        </TextContent>

        <TextContent>
          <Text component={TextVariants.h4}>
            To help us resolve the issue quickly, we recommend following these steps using the DevTool browser
          </Text>
          <List>
            <ListItem>Open the DevTool browser (F12)</ListItem>
            <ListItem>
              Navigate to the "Network" and "Console" tab. Look for any error messages or red-highlighted lines. These
              will provide essential clues about what went wrong
            </ListItem>
            <ListItem>
              Capture screenshots of the error and any relevant details displayed in the console. This will help our
              development team better understand the problem
            </ListItem>
          </List>
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

export default ErrorHttp;
