import { FormEvent, Ref, Suspense, startTransition, useEffect, useState } from 'react';

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
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { DARK_THEME_CLASS, brandLogo } from '@config/config';
import { getThemePreference, removeThemePreference, setThemePreference } from '@core/utils/isDarkTheme';

export enum HeaderLabels {
  Logout = 'Logout',
  DarkMode = ' Dark mode',
  DarkModeTestId = 'dark-mode-testId',
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
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleChange = (_event: FormEvent<HTMLInputElement>, checked: boolean) => {
    setIsChecked(checked);

    checked ? setThemePreference(DARK_THEME_CLASS) : removeThemePreference();
  };

  useEffect(() => {
    const isDarkTheme = getThemePreference() ? true : false;
    setIsChecked(isDarkTheme);
  }, []);

  return (
    <Switch
      label={HeaderLabels.DarkMode}
      labelOff={HeaderLabels.DarkMode}
      isChecked={isChecked}
      onChange={handleChange}
      data-testid={HeaderLabels.DarkModeTestId}
    />
  );
};

export const UserDropdown = function () {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['QueriesGetUser'],
    queryFn: () => RESTApi.fetchUser()
  });

  const { refetch } = useQuery({
    queryKey: ['QueryLogout'],
    queryFn: () => RESTApi.fetchLogout(),
    enabled: false
  });

  function refetchLogout() {
    refetch();

    if (user?.authType === HeaderLabels.OpenShiftAuth) {
      navigate(0);
    }
  }

  function onToggleClick() {
    setIsOpen(!isOpen);
  }

  function handleLogout() {
    refetchLogout();

    startTransition(() => {
      setIsOpen(false);
    });
  }

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
