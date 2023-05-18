import { FC } from 'react';

import { Card, CardHeader, Flex, Title, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
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
          <Title headingLevel="h1">{title}</Title>
          {description && (
            <Tooltip position="right" content={description}>
              <OutlinedQuestionCircleIcon />
            </Tooltip>
          )}
          {link && <Link to={link}>{`(${linkLabel})`}</Link>}
        </Flex>
      </CardHeader>
    </Card>
  );
};

export default SkTitle;
