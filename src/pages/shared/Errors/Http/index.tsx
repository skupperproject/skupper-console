import { FC, MouseEventHandler } from 'react';

import {
  Button,
  Divider,
  List,
  ListItem,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';

import { Labels } from './Http.enum';

const ErrorHttp: FC<{ code?: string; message?: string; onReset?: MouseEventHandler<HTMLButtonElement> }> = function ({
  code,
  message,
  onReset
}) {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <TextContent>
        <Title headingLevel="h1">{message || Labels.ErrorTitle}</Title>
        <Title headingLevel="h2">{code || ''}</Title>
        <Divider />

        <Text component={TextVariants.h2}>
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

          <ListItem>
            <Button id="sk-try-again" variant="primary" onClick={onReset}>
              Try again
            </Button>
          </ListItem>
        </List>
      </TextContent>
    </PageSection>
  );
};
export default ErrorHttp;
