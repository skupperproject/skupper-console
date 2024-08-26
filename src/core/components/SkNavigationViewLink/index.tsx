import { FC, ReactElement } from 'react';

import { Button, Icon, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { ListIcon, TopologyIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

const icons: Record<string, ReactElement> = {
  topologyIcon: <TopologyIcon />,
  listIcon: <ListIcon />
};

const SkNavigationViewLink: FC<{ link: string; linkLabel: string; iconName?: 'topologyIcon' | 'listIcon' }> =
  function ({ link, linkLabel, iconName = 'topologyIcon' }) {
    return (
      <TextContent>
        <Link to={link} style={{ whiteSpace: 'nowrap' }} title={linkLabel}>
          <Text component={TextVariants.p}>
            <Button>
              <Icon isInline data-testid={iconName}>
                {icons[iconName]}
              </Icon>
            </Button>
          </Text>
        </Link>
      </TextContent>
    );
  };

export default SkNavigationViewLink;
