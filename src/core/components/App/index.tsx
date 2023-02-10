import React, { Suspense, useEffect } from 'react';

import { Page } from '@patternfly/react-core';
import { useLocation, useNavigate } from 'react-router-dom';

import AppContent from '@layout/AppContent';
import Header from '@layout/Header';
import SideBar from '@layout/SideBar';
import { REDIRECT_TO_PATH } from 'config';
import { routes } from 'routes';

import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import './App.css';

const App = function () {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname === '/') {
            navigate(REDIRECT_TO_PATH);
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
                <AppContent>{routes}</AppContent>
            </Suspense>
        </Page>
    );
};

export default App;
