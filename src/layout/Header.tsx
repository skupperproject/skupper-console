import { Ref, Suspense, useEffect, useState } from 'react';

import {
  Brand,
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadLogo,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  MastheadBrand,
  MenuToggle,
  MenuToggleElement,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '../API/REST.resources';
import { brandLogo } from '../config/app';

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
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton variant="plain">
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadBrand data-codemods>
          <MastheadLogo data-codemods>
            <Brand src={brandLogo} alt="logo" heights={{ default: '45px' }} />
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>

      <MastheadContent>
        <Toolbar isFullHeight>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignEnd' }} gap={{ default: 'gapMd' }}>
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
