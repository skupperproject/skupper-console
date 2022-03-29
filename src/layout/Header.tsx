import React from 'react';

import { Brand, PageHeader, Text, TextContent, TextVariants } from '@patternfly/react-core';

import Logo from '@assets/skupper.svg';

import './Header.scss';

const SKUPPER_TEXT_LOGO = 'Skupper';

const Header = function () {
  return (
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
      showNavToggle
    />
  );
};

export default Header;
