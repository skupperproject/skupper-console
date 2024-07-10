import { Ref, Suspense, useEffect, useState } from 'react';

import {
  Brand,
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  MenuToggleElement,
  PageToggleButton,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { BarsIcon, MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { DARK_THEME_CLASS, brandLogo } from '@config/config';
import { getThemePreference, removeThemePreference, setThemePreference } from '@core/utils/isDarkTheme';

export enum HeaderLabels {
  Logout = 'Logout',
  DarkMode = ' Dark mode',
  LightModeTestId = 'light-mode-btn-testId',
  DarkModeTestId = 'dark-mode-btn-testId',
  UserDropdownTestId = 'user-dropdown-testId',
  OpenShiftAuth = 'openshift'
}

const SkHeader = function () {
  return (
    <Masthead className="sk-header" data-testid="sk-header">
      <MastheadToggle>
        <PageToggleButton variant="plain">
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>

      <MastheadMain>
        <MastheadBrand>
          <Brand src={brandLogo} alt="logo" heights={{ default: '45px' }} />
        </MastheadBrand>
      </MastheadMain>

      <MastheadContent>
        <Toolbar isFullHeight>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignRight' }} spacer={{ default: 'spacerMd' }}>
              <ToolbarItem>
                <DarkModeSwitch />
              </ToolbarItem>

              <ToolbarItem>
                <Suspense fallback={null}>
                  <UserDropdown />
                </Suspense>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );
};

export default SkHeader;

export const DarkModeSwitch = function () {
  const [isDarkModeSelected, setIsDarkModeSelected] = useState<boolean>(false);

  const handleChange = (isDarkMode: boolean) => {
    setIsDarkModeSelected(isDarkMode);

    isDarkMode ? setThemePreference(DARK_THEME_CLASS) : removeThemePreference();
  };

  useEffect(() => {
    const isDarkTheme = getThemePreference() ? true : false;
    setIsDarkModeSelected(isDarkTheme);
  }, []);

  return (
    <ToggleGroup>
      <ToggleGroupItem
        data-testid={HeaderLabels.LightModeTestId}
        icon={<SunIcon />}
        isSelected={!isDarkModeSelected}
        onClick={() => handleChange(false)}
      />
      <ToggleGroupItem
        data-testid={HeaderLabels.DarkModeTestId}
        icon={<MoonIcon />}
        isSelected={isDarkModeSelected}
        onClick={() => handleChange(true)}
      />
    </ToggleGroup>
  );
};

export const UserDropdown = function () {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['QueriesGetUser'],
    queryFn: () => RESTApi.fetchUser(),
    throwOnError: false
  });

  const { refetch: refetchLogout, isSuccess: isLogoutSuccess } = useQuery({
    queryKey: ['QueryLogout'],
    queryFn: () => RESTApi.fetchLogout(),
    enabled: false
  });

  function onToggleClick() {
    setIsOpen(!isOpen);
  }

  function handleLogout() {
    refetchLogout();
    setIsOpen(false);
  }

  useEffect(() => {
    if (isLogoutSuccess) {
      navigate(0);
    }
  }, [isLogoutSuccess, navigate]);

  if (!user?.username || user?.authType !== HeaderLabels.OpenShiftAuth) {
    return null;
  }

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={handleLogout}
      onOpenChange={setIsOpen}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          isFullHeight
          data-testid={HeaderLabels.UserDropdownTestId}
        >
          {user?.username}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        <DropdownItem value={0}>{HeaderLabels.Logout}</DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
