import { Brand, PageHeader, Text, TextContent, TextVariants } from '@patternfly/react-core';

import { brandLogo, brandName } from '@config/config';

const Header = function () {
  return (
    <PageHeader
      className="sk-header"
      logo={
        <>
          <Brand src={brandLogo} alt="skupper logo" />

          <TextContent>
            <Text component={TextVariants.h1} className="pf-u-pl-md pf-u-font-weight-bold">
              {brandName}
            </Text>
          </TextContent>
        </>
      }
      showNavToggle
    />
  );
};

export default Header;
