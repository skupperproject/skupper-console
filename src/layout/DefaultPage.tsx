import { FC, ReactElement } from 'react';

import { Flex, PageSection, PageSectionVariants, Text, TextContent, Title } from '@patternfly/react-core';

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
  children?: ReactElement;
  secondaryChildren?: ReactElement;
}

const SkDefaultPage: FC<SkDefaultPageProps> = function ({
  dataTestId,
  title,
  link,
  linkLabel = TopologyLabels.Topology,
  description,
  secondaryChildren,
  children
}) {
  return (
    <TransitionPage>
      <div data-testid={dataTestId}>
        <PageSection role="sk-heading" variant={PageSectionVariants.light} style={{ padding: '0 21px' }}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ padding: '18px 0' }}>
            <TextContent>
              <Title headingLevel="h1">{title}</Title>
              {description && <Text component="p">{description}</Text>}
            </TextContent>
            {link && <NavigationViewLink link={link} linkLabel={linkLabel} />}
          </Flex>

          {children}
        </PageSection>

        <PageSection isFilled>{secondaryChildren}</PageSection>
      </div>
    </TransitionPage>
  );
};

export default SkDefaultPage;
