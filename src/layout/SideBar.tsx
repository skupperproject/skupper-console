import React from 'react';

import { Nav, NavItem, NavList, PageSidebar } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

import { RoutesProps } from '../routes/routes.constants';
import { RouteProps } from '../routes/routes.interfaces';

interface NavBarProps {
  navItems: RouteProps[];
}

const NavBar = ({ navItems }: NavBarProps) => {
  const { pathname } = useLocation();

  return (
    <Nav>
      <NavList>
        {navItems.map((navItem) => (
          <NavItem key={navItem.path} isActive={pathname === `/${navItem.path}`}>
            <Link to={`${navItem.path}`}>{navItem.name}</Link>
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );
};

const SideBar = () => <PageSidebar nav={<NavBar navItems={RoutesProps} />} theme="dark" />;

export default SideBar;
