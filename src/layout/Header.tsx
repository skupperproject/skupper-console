import React from 'react';

import {
  Brand,
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

import Logo from '../assets/skupper.svg';

const HeaderToolbar = (
  <PageHeaderTools>
    <PageHeaderToolsGroup>
      <PageHeaderToolsItem>
        <TextContent>
          <Text component={TextVariants.h4}>
            Site <span className="pf-u-font-weight-bold">Private 1</span>
          </Text>
        </TextContent>
      </PageHeaderToolsItem>
    </PageHeaderToolsGroup>
  </PageHeaderTools>
);

const Header = () => (
  <PageHeader
    logo={<Brand src={Logo} alt="Logo" className="pf-u-w-100" />}
    headerTools={HeaderToolbar}
    showNavToggle
  />
);

export default Header;
