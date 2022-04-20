import React, { useEffect } from 'react';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import AppContent from '@layout/AppContent';

import { OverviewRoutesPaths } from './Network.enum';

const Network = function () {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            navigate(OverviewRoutesPaths.Overview);
        }
    }, [pathname, navigate]);

    return (
        <AppContent>
            <Outlet />
        </AppContent>
    );
};

export default Network;
