import React, { useEffect, useState } from 'react';

import { Nav, NavItem, NavList } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

import { SiteLabels, SiteRoutesPaths } from '../site.enum';

const navItems = [{ pathname: SiteRoutesPaths.Overview, label: SiteLabels.RouteOverview }];

const NavBarSite = function () {
  const [activeItem, setActiveItem] = useState<string | number>(0);
  const { pathname } = useLocation();
  function handleSetTab({ itemId }: { itemId: number | string }) {
    setActiveItem(itemId);
  }

  useEffect(() => {
    const selectedItem = navItems.findIndex(({ pathname: itemPathName }) =>
      pathname.endsWith(itemPathName),
    );

    setActiveItem(selectedItem);
  }, [pathname]);

  return (
    <Nav onSelect={handleSetTab} variant="horizontal">
      <NavList>
        {navItems.map((item, index) => (
          <NavItem key={item.pathname} isActive={activeItem === index} itemId={index}>
            <Link to={item.pathname}>{item.label}</Link>
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );
};

export default NavBarSite;
