import { Nav, NavItem, NavList } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

import { NavigationPaths } from '../../../config/navigation';

const NavBar = function () {
  const { pathname } = useLocation();

  return (
    <Nav data-testid="sk-nav-bar-component">
      <NavList>
        {NavigationPaths.map(({ name, path }) => (
          <NavItem key={path} isActive={pathname.startsWith(`${path}`)}>
            <Link to={`${path}`}>{name}</Link>
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );
};

export default NavBar;
