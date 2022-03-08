import React from 'react';

import { Page } from '@patternfly/react-core';

import AppContent from './layout/AppContent';
import Header from './layout/Header';
import SideBar from './layout/SideBar';
import Routes from './routes';

import './App.scss';

function App() {
  return (
    <Page header={<Header />} sidebar={<SideBar />} isManagedSidebar>
      <AppContent>
        <Routes />
      </AppContent>
    </Page>
  );
}

export default App;
