import { FC } from 'react';

import { Card, CardHeader, Flex, Text, TextContent } from '@patternfly/react-core';

import { TopologyLabels } from '@pages/Topology/Topology.enum';

import NavigationViewLink from '../NavigationViewLink';

interface SkTitleProps {
  title: string;
  link?: string;
  linkLabel?: string;
  description?: string;
  isPlain?: boolean;
}

const SkTitle: FC<SkTitleProps> = function ({
  title,
  link,
  linkLabel = TopologyLabels.Topology,
  description,
  isPlain = false
}) {
  return (
    <Card role="sk-heading" isPlain={isPlain}>
      <CardHeader style={{ justifyContent: 'space-between' }}>
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <TextContent>
            <Text component="h1">{title}</Text>
            {description && <Text component="p">{description}</Text>}
          </TextContent>
        </Flex>
        {link && <NavigationViewLink link={link} linkLabel={linkLabel} />}
      </CardHeader>
    </Card>
  );
};

export default SkTitle;
