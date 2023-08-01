import {
  Brand,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
  Title
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';

import { brandLogo, brandName } from '@config/config';

const SkHeader = function () {
  return (
    <Masthead className="sk-header" data-testid="sk-header">
      <MastheadToggle>
        <PageToggleButton variant="plain">
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand href="https://patternfly.org" target="_blank">
          <Brand src={brandLogo} alt="logo" heights={{ default: '45px' }}>
            <source srcSet={brandLogo} />
          </Brand>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent> {brandName && <Title headingLevel="h1">{brandName}</Title>}</MastheadContent>
    </Masthead>
  );
};

export default SkHeader;
