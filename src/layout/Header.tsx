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

import { brandLogo } from '@config/config';

const storageKey = 'theme-preference';
const DARK_THEME_CLASS = 'pf-v5-theme-dark';

const SkHeader = function () {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleChange = (_event: FormEvent<HTMLInputElement>, checked: boolean) => {
    const htmlElement = document.querySelector('html') as HTMLElement;

    checked ? htmlElement.classList.add(DARK_THEME_CLASS) : htmlElement.classList.remove(DARK_THEME_CLASS);
    checked ? localStorage.setItem(storageKey, DARK_THEME_CLASS) : localStorage.removeItem(storageKey);

    setIsChecked(checked);
  };

  useEffect(() => {
    const themePreference = localStorage.getItem(storageKey);

    if (themePreference) {
      const htmlElement = document.querySelector('html') as HTMLElement;
      htmlElement.classList.add(themePreference);
      setIsChecked(true);

      return;
    }

    setIsChecked(false);
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
                <Switch
                  label="Dark theme"
                  labelOff="Dark theme"
                  isChecked={isChecked}
                  onChange={handleChange}
                  ouiaId="BasicSwitch"
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );
};

export default SkHeader;
