import { FC } from 'react';

import { Button, Card, CardHeader, Flex, TextContent, Text, Title } from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import { SkTitleLabels } from './SkTitle.enum';
import ResourceIcon, { ResourceIconProps } from '../ResourceIcon';

interface SkTitleProps {
  title: string;
  icon?: ResourceIconProps['type'];
  link?: string;
  linkLabel?: string;
  description?: string;
}

const SkTitle: FC<SkTitleProps> = function ({
  title,
  icon,
  link,
  linkLabel = SkTitleLabels.GoToTopology,
  description
}) {
  return (
    <Card role="sk-heading">
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          {icon && <ResourceIcon type={icon} />}

          <TextContent>
            <Title headingLevel="h1">{title}</Title>
            {description && <Text component="p">{description}</Text>}
          </TextContent>

          {link && <Button component={(props) => <Link {...props} to={link} />}>{linkLabel}</Button>}
        </Flex>
      </CardHeader>
    </Card>
  );
};

export default SkTitle;
