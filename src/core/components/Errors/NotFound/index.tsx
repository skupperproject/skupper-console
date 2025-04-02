import { Bullseye, PageSection, Content, ContentVariants } from '@patternfly/react-core';

import { Labels } from '../../../../config/labels';
import { getTestsIds } from '../../../../config/testIds';

const NotFound = function () {
  return (
    <PageSection hasBodyWrapper={false} data-testid={getTestsIds.notFoundView()}>
      <Bullseye>
        <Content>
          <Content component={ContentVariants.h1}>{Labels.NoFoundError}</Content>
        </Content>
      </Bullseye>
    </PageSection>
  );
};

export default NotFound;
