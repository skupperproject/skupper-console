import React, { Suspense } from 'react';

import { Page } from '@patternfly/react-core';

import AppContent from '@layout/AppContent';
import Header from '@layout/Header';
import SideBar from '@layout/SideBar';
import { routes } from 'routes';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import './App.css';

const App = function () {
    return (
        <Page
            header={<Header />}
            sidebar={<SideBar />}
            isManagedSidebar
            className="app-main-container"
        >
            <Suspense fallback={<div />}>
                <AppContent>{routes}</AppContent>
            </Suspense>
        </Page>
    );
};

export default App;
