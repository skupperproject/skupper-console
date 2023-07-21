import { FC, ReactElement } from 'react';

import { Flex, PageSection, PageSectionVariants, Text, TextContent, Title } from '@patternfly/react-core';

import { TopologyLabels } from '@pages/Topology/Topology.enum';

import NavigationViewLink from '../NavigationViewLink';

interface SkTitleProps {
  dataTestId?: string;
  title: string;
  link?: string;
  linkLabel?: string;
  description?: string;
  isPlain?: boolean;
  children?: ReactElement;
  secondaryChildren?: ReactElement;
}

const SkTitle: FC<SkTitleProps> = function ({
  dataTestId,
  title,
  link,
  linkLabel = TopologyLabels.Topology,
  description,
  secondaryChildren,
  children
}) {
  return (
    <>
      <PageSection
        role="sk-heading"
        variant={PageSectionVariants.light}
        style={{ padding: '0 21px' }}
        data-testid={dataTestId}
      >
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ padding: '18px 0' }}>
          <TextContent>
            <Title headingLevel="h1">{title}</Title>
            {description && <Text component="p">{description}</Text>}
          </TextContent>
          {link && <NavigationViewLink link={link} linkLabel={linkLabel} />}
        </Flex>

        {children}
      </PageSection>

      <PageSection>{secondaryChildren}</PageSection>
    </>
  );
};

export default SkTitle;
