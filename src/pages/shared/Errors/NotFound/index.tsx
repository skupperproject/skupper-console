import { Bullseye, Text, TextContent, TextVariants } from '@patternfly/react-core';

import { Labels } from './NotFound.enum';

const NotFound = function () {
  return (
    <Bullseye data-testid="sk-not-found-view">
      <TextContent>
        <Text component={TextVariants.h1}>{Labels.ErrorTitle}</Text>
      </TextContent>
    </Bullseye>
  );
};

export default NotFound;
