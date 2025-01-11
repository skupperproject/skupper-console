import { FC, ReactElement } from 'react';

import { Button, Icon, Content, ContentVariants, ButtonVariant } from '@patternfly/react-core';
import { ListIcon, TopologyIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

const icons: Record<string, ReactElement> = {
  topologyIcon: <TopologyIcon />,
  listIcon: <ListIcon />
};

const SkNavigationViewLink: FC<{ link: string; linkLabel: string; iconName?: 'topologyIcon' | 'listIcon' }> =
  function ({ link, linkLabel, iconName = 'topologyIcon' }) {
    return (
      <Content>
        <Link to={link} style={{ whiteSpace: 'nowrap' }} title={linkLabel}>
          <Content component={ContentVariants.p}>
            <Button
              variant={ButtonVariant.stateful}
              icon={
                <Icon isInline data-testid={iconName}>
                  {icons[iconName]}
                </Icon>
              }
            />
          </Content>
        </Link>
      </Content>
    );
  };

export default SkNavigationViewLink;
