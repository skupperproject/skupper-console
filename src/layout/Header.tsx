import { Brand, PageHeader, Title } from '@patternfly/react-core';

import { brandLogo, brandName } from '@config/config';

const Header = function () {
  return (
    <PageHeader
      className="sk-header"
      logo={
        <>
          <Brand src={brandLogo} alt="logo" heights={{ default: '70px' }}>
            <source srcSet={brandLogo} />
          </Brand>

          {brandName && <Title headingLevel="h1">{brandName}</Title>}
        </>
      }
      showNavToggle
    />
  );
};

export default Header;
