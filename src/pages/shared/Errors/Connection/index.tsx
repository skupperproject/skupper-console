import {
  TextContent,
  Text,
  TextVariants,
  List,
  ListItem,
  Button,
  Divider,
  Title,
  PageSection,
  PageSectionVariants
} from '@patternfly/react-core';
import { useLocation, useNavigate } from 'react-router-dom';

import { Labels } from './Connection.enum';

const ErrorConnection = function () {
  const navigate = useNavigate();
  const { state } = useLocation();

  function handleRetryConnection() {
    navigate(state?.pathname || -1);
  }

  const title = state?.code ? `${state.code}   ${state?.message || ''}` : '';

  return (
    <PageSection variant={PageSectionVariants.light}>
      <TextContent>
        <Title headingLevel="h1">
          {Labels.ErrorTitle}: {title}
        </Title>

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
            <Button id="sk-try-again" variant="primary" onClick={handleRetryConnection}>
              Try again
            </Button>
          </ListItem>
        </List>
      </TextContent>
    </PageSection>
  );
};

export default ErrorConnection;
