import { Bullseye, PageSection, Content, ContentVariants } from '@patternfly/react-core';

import { NotFoundLabels } from './NotFound.enum';

const NotFound = function () {
  return (
    <PageSection hasBodyWrapper={false}>
      <Bullseye data-testid="sk-not-found-view">
        <Content>
          <Content component={ContentVariants.h1}>{NotFoundLabels.ErrorTitle}</Content>
        </Content>
      </Bullseye>
    </PageSection>
  );
};

export default NotFound;
