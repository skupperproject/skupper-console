import { Bullseye, PageSection, Content, ContentVariants } from '@patternfly/react-core';

import { Labels } from '../../../../config/labels';

const NotFound = function () {
  return (
    <PageSection hasBodyWrapper={false}>
      <Bullseye data-testid="sk-not-found-view">
        <Content>
          <Content component={ContentVariants.h1}>{Labels.NoFoundError}</Content>
        </Content>
      </Bullseye>
    </PageSection>
  );
};

export default NotFound;
