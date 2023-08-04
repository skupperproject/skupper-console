import { FC, ReactElement } from 'react';

import { Icon, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { ListIcon, TopologyIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

const icons: Record<string, ReactElement> = {
  topologyIcon: <TopologyIcon />,
  listIcon: <ListIcon />
};

const NavigationViewLink: FC<{ link: string; linkLabel: string; iconName?: 'topologyIcon' | 'listIcon' }> = function ({
  link,
  linkLabel,
  iconName = 'topologyIcon'
}) {
  return (
    <TextContent>
      <Link to={link} style={{ whiteSpace: 'nowrap' }}>
        <Text component={TextVariants.p}>
          <Icon isInline>{icons[iconName]}</Icon> {linkLabel}
        </Text>
      </Link>
    </TextContent>
  );
};

export default NavigationViewLink;
