import React, { useEffect } from 'react';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import AppContent from '@layout/AppContent';

import { DeploymentsRoutesPaths } from './Deployments.enum';

const Services = function () {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            navigate(DeploymentsRoutesPaths.Overview);
        }
    }, [pathname, navigate]);

    return (
        <AppContent>
            <Outlet />
        </AppContent>
    );
};

export default Services;
