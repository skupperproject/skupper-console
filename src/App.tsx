import React, { useCallback, useEffect, useRef } from 'react';

import { Page } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { CONNECTION_TIMEOUT, MSG_TIMEOUT_ERROR, UPDATE_INTERVAL } from './App.constant';
import { ErrorTypes } from './App.enum';
import { useConnectionErrType, useDataVAN } from './contexts/Data';
import AppContent from './layout/AppContent';
import Header from './layout/Header';
import SideBar from './layout/SideBar';
import LoadingPage from './pages/Loading/Loading';
import Routes from './routes';
import { RoutesPaths } from './routes/routes.enum';
import restService from './services/REST';
import { wait } from './utils/wait';

import './App.scss';

function App() {
  const prevDataVan = useRef({});
  const { connectionErrType, setConnectionErrType } = useConnectionErrType();
  const { dataVAN, setDataVAN } = useDataVAN();

  const navigate = useNavigate();

  const handleFetchData = useCallback(async () => {
    try {
      const data = await Promise.race([
        restService.fetchData(),
        wait(CONNECTION_TIMEOUT, ErrorTypes.Server),
      ]);

      if (data === ErrorTypes.Server) {
        // eslint-disable-next-line no-debugger
        debugger;
        throw new Error(MSG_TIMEOUT_ERROR);
      }

      if (data && JSON.stringify(data) !== JSON.stringify(prevDataVan.current)) {
        prevDataVan.current = data;
        setDataVAN(data);
        setConnectionErrType('');
      }
    } catch ({ httpStatus, message }) {
      const type = httpStatus ? ErrorTypes.Server : ErrorTypes.Connection;

      setConnectionErrType(type);
    }
  }, [setConnectionErrType, setDataVAN]);

  useEffect(() => {
    if (connectionErrType) {
      const route =
        connectionErrType === ErrorTypes.Server ? RoutesPaths.ErrServer : RoutesPaths.ErrConnection;
      navigate(route);
    }
  }, [connectionErrType, navigate]);

  useEffect(() => {
    handleFetchData();
    setInterval(handleFetchData, UPDATE_INTERVAL);
  }, [handleFetchData]);

  return (
    <Page header={<Header />} sidebar={<SideBar />} isManagedSidebar>
      <AppContent>
        {(dataVAN || connectionErrType) && <Routes />}
        {!dataVAN && !connectionErrType && <LoadingPage />}
      </AppContent>
    </Page>
  );
}

export default App;
