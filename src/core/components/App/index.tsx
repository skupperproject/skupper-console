import React, { Suspense, useEffect } from 'react';

import { Page } from '@patternfly/react-core';
import { useLocation, useNavigate, useRoutes } from 'react-router-dom';

import AppContent from '@layout/AppContent';
import Header from '@layout/Header';
import SideBar from '@layout/SideBar';
import { DEFAULT_VIEW } from 'config';
import { routes } from 'routes';

import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import './App.css';

const App = function () {
    const appRoutes = useRoutes(routes);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname === '/') {
            navigate(DEFAULT_VIEW);
        }
    }, [pathname, navigate]);

    return (
        <Page
            header={<Header />}
            sidebar={<SideBar />}
            isManagedSidebar
            className="app-main-container"
        >
            <Suspense fallback={<span />}>
                <AppContent>{appRoutes}</AppContent>
            </Suspense>
        </Page>
    );
};

export default App;
