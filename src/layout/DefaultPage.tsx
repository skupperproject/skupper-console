import { FC, ReactElement } from 'react';

import {
  Flex,
  PageGroup,
  PageNavigation,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  Title
} from '@patternfly/react-core';

import { TopologyLabels } from '@pages/Topology/Topology.enum';

import NavigationViewLink from '../core/components/NavigationViewLink';
import TransitionPage from '../core/components/TransitionPages/Fade';

interface SkDefaultPageProps {
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

const SkDefaultPage: FC<SkDefaultPageProps> = function ({
  dataTestId,
  title,
  link,
  linkLabel = TopologyLabels.Topology,
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

        {navigationComponent && <PageNavigation>{navigationComponent}</PageNavigation>}
        {mainContentChildren && (
          <PageSection padding={{ default: hasMainContentPadding ? 'noPadding' : 'padding' }} isFilled={true}>
            {mainContentChildren}
          </PageSection>
        )}
      </PageGroup>
    </TransitionPage>
  );
};

export default SkDefaultPage;
