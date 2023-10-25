import { FormEvent, useEffect, useState } from 'react';

import {
  Brand,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';

import { DARK_THEME_CLASS, brandLogo } from '@config/config';
import { getThemePreference, removeThemePreference, setThemePreference } from '@core/utils/isDarkTheme';

const SkHeader = function () {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleChange = (_event: FormEvent<HTMLInputElement>, checked: boolean) => {
    checked ? setThemePreference(DARK_THEME_CLASS) : removeThemePreference();
    setIsChecked(checked);
  };

  useEffect(() => {
    getThemePreference() ? setIsChecked(true) : setIsChecked(false);
  }, []);

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
      <MastheadContent>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignRight' }}>
              <ToolbarItem>
                <Switch label="Dark theme" labelOff="Dark theme" isChecked={isChecked} onChange={handleChange} />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );
};

export default SkHeader;
