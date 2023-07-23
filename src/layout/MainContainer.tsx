import { FC, ReactElement } from 'react';

import { Flex, PageGroup, PageSection, PageSectionVariants, Text, TextContent, Title } from '@patternfly/react-core';

import { TopologyLabels } from '@pages/Topology/Topology.enum';

import NavigationViewLink from '../core/components/NavigationViewLink';
import TransitionPage from '../core/components/TransitionPages/Fade';

interface MainContainerProps {
  dataTestId?: string;
  title: string;
  link?: string;
  linkLabel?: string;
  description?: string;
  isPlain?: boolean;
  hasMainContentPadding?: boolean;
  navigationComponent?: ReactElement;
  mainContentChildren?: ReactElement;
}

const MainContainer: FC<MainContainerProps> = function ({
  dataTestId,
  title,
  link,
  linkLabel = TopologyLabels.TopologyView,
  description,
  hasMainContentPadding = false,
  navigationComponent,
  mainContentChildren
}) {
  return (
    <TransitionPage>
      <PageGroup data-testid={dataTestId}>
        <PageSection role="sk-heading" variant={PageSectionVariants.light}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <TextContent>
              <Title headingLevel="h1">{title}</Title>
              {description && <Text component="p">{description}</Text>}
            </TextContent>
            {link && <NavigationViewLink link={link} linkLabel={linkLabel} />}
          </Flex>
        </PageSection>

        {navigationComponent && (
          <PageSection style={{ padding: '0 21px' }} variant={PageSectionVariants.light}>
            <Flex>{navigationComponent}</Flex>
          </PageSection>
        )}
        {mainContentChildren && (
          <PageSection padding={{ default: hasMainContentPadding ? 'noPadding' : 'padding' }} isFilled={true}>
            {mainContentChildren}
          </PageSection>
        )}
      </PageGroup>
    </TransitionPage>
  );
};

export default MainContainer;
