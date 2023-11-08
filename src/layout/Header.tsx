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

enum HeaderLabels {
  Logout = 'Logout',
  DarkMode = ' Dark mode'
}

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
        <MastheadBrand>
          <Brand src={brandLogo} alt="logo" heights={{ default: '45px' }} />
        </MastheadBrand>
      </MastheadMain>

      <MastheadContent>
        <Toolbar isFullHeight>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignRight' }} spacer={{ default: 'spacerMd' }}>
              <ToolbarItem>
                <DarkModeSwitch isChecked={isChecked} onChange={handleChange} />
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

const DarkModeSwitch = function ({
  isChecked,
  onChange
}: {
  isChecked: boolean;
  onChange: (event: FormEvent<HTMLInputElement>, checked: boolean) => void;
}) {
  return (
    <Switch label={HeaderLabels.DarkMode} labelOff={HeaderLabels.DarkMode} isChecked={isChecked} onChange={onChange} />
  );
};

const UserDropdown = function () {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['QueriesGetUser'],
    queryFn: () => RESTApi.fetchUser()
  });

  //TOD: use useQuery after refactoring and disabling the global prop suspense: true
  // Currently  the logout query ignore the prop enabled: false  creating a infinite loop
  const refetchLogout = async () => {
    try {
      await RESTApi.fetchLogout();

      if (user?.authType === 'openshift') {
        navigate(0);
      }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  function onToggleClick() {
    setIsOpen(!isOpen);
  }

  function handleLogout() {
    refetchLogout();

    startTransition(() => {
      setIsOpen(false);
    });
  }

  if (!user?.username || user?.authType !== 'openshift') {
    return null;
  }

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={handleLogout}
      onOpenChange={setIsOpen}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isFullHeight>
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
