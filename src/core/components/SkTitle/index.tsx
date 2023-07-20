import { FC } from 'react';

import { Card, CardHeader, Flex, Text, TextContent } from '@patternfly/react-core';

import { TopologyLabels } from '@pages/Topology/Topology.enum';

import NavigationViewLink from '../NavigationViewLink';
import ResourceIcon, { ResourceIconProps } from '../ResourceIcon';

interface SkTitleProps {
  title: string;
  icon?: ResourceIconProps['type'];
  link?: string;
  linkLabel?: string;
  description?: string;
}

const SkTitle: FC<SkTitleProps> = function ({ title, icon, link, linkLabel = TopologyLabels.Topology, description }) {
  return (
    <Card role="sk-heading">
      <CardHeader style={{ justifyContent: 'space-between' }}>
        <Flex>
          {icon && <ResourceIcon type={icon} />}
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
