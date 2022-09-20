import React from 'react';

import { Nav, NavItem, NavList } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

import { RoutesProps } from './NavBar.constants';

const NavBar = function () {
    const { pathname } = useLocation();

    return (
        <Nav data-cy="sk-nav-bar">
            <NavList>
                {RoutesProps.map(({ name, path }) => (
                    <NavItem key={path} isActive={pathname.startsWith(`${path}`)}>
                        <Link to={`${path}`}>{name}</Link>
                    </NavItem>
                ))}
            </NavList>
        </Nav>
    );
};

export default NavBar;
