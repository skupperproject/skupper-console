import { FC, MouseEventHandler } from 'react';

import { Button, Divider, List, ListItem, PageSection, Content, ContentVariants, Title } from '@patternfly/react-core';

import { Labels } from '../../../../config/labels';

const ErrorHttp: FC<{ code?: string; message?: string; onReset?: MouseEventHandler<HTMLButtonElement> }> = function ({
  code,
  message,
  onReset
}) {
  return (
    <PageSection hasBodyWrapper={false}>
      <Content>
        <Title headingLevel="h1">{message || Labels.HttpError}</Title>
        <Title headingLevel="h2">{code || ''}</Title>
        <Divider />

        <Content component={ContentVariants.h2}>
          To help us resolve the issue quickly, we recommend following these steps using the DevTool browser
        </Content>

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
      </Content>
    </PageSection>
  );
};
export default ErrorHttp;
