import { Nav, NavItem, NavList } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

import { RoutesPropsConfig } from '@config/config';

const NavBar = function () {
  const { pathname } = useLocation();

  return (
    <Nav data-testid="sk-nav-bar-component">
      <NavList>
        {RoutesPropsConfig.map(({ name, path }) => (
          <NavItem key={path} isActive={pathname.startsWith(`${path}`)}>
            <Link to={`${path}`}>{name}</Link>
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );
};

export default NavBar;
