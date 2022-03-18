import React, { useEffect } from 'react';

import { Page } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { ErrorTypes } from './App.enum';
import { useConnectionErrType, useIsLoadingData } from './contexts/Data';
import AppContent from './layout/AppContent';
import Header from './layout/Header';
import SideBar from './layout/SideBar';
import LoadingPage from './pages/Loading/Loading';
import Routes from './routes';
import { RoutesPaths } from './routes/routes.enum';

import './App.scss';

function App() {
  const { connectionErrType, setConnectionErrType } = useConnectionErrType();
  const { isLoadingData } = useIsLoadingData();

  const navigate = useNavigate();

  useEffect(() => {
    if (connectionErrType) {
      const route =
        connectionErrType === ErrorTypes.Server ? RoutesPaths.ErrServer : RoutesPaths.ErrConnection;

      navigate(route);
      setConnectionErrType('');
    }
  }, [connectionErrType, navigate, setConnectionErrType]);

  return (
    <Page header={<Header />} sidebar={<SideBar />} isManagedSidebar>
      <AppContent>
        {isLoadingData && <LoadingPage />}
        <Routes />
      </AppContent>
    </Page>
  );
}

export default App;
