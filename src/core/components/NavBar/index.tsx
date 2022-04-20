import React from 'react';

import { Nav, NavItem, NavList } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

import { RoutesProps } from './NavBar.constants';

const NavBar = function () {
    const { pathname } = useLocation();

    return (
        <Nav>
            <NavList>
                {RoutesProps.map((navItem) => (
                    <NavItem key={navItem.path} isActive={pathname.startsWith(`${navItem.path}`)}>
                        <Link to={`${navItem.path}`}>{navItem.name}</Link>
                    </NavItem>
                ))}
            </NavList>
        </Nav>
    );
};

export default NavBar;
