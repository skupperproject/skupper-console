import React from 'react';

import { Nav, NavItem, NavList, PageSidebar } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

import { RoutesProps } from './SideBar.constants';
import { SideBarRouteProps } from './SideBar.interfaces';

interface NavBarProps {
  navItems: SideBarRouteProps[];
}

const NavBar = function ({ navItems }: NavBarProps) {
  const { pathname } = useLocation();

  return (
    <Nav>
      <NavList>
        {navItems.map((navItem) => (
          <NavItem key={navItem.path} isActive={pathname.startsWith(`${navItem.path}`)}>
            <Link to={`${navItem.path}`}>{navItem.name}</Link>
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );
};

const SideBar = function () {
  return (
    <PageSidebar className="pf-u-w-auto" nav={<NavBar navItems={RoutesProps} />} theme="dark" />
  );
};

export default SideBar;
