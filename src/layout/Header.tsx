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

import './Header.scss';

const SKUPPER_TEXT_LOGO = 'Skupper';

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
    className="sk-header"
    logo={
      <>
        <Brand src={Logo} alt="skupper logo" className="sk-logo__img" />
        <TextContent>
          <Text component={TextVariants.h4} className="pf-u-pl-md pf-u-font-weight-bold">
            {SKUPPER_TEXT_LOGO}
          </Text>
        </TextContent>
      </>
    }
    headerTools={HeaderToolbar}
    showNavToggle
  />
);

export default Header;
