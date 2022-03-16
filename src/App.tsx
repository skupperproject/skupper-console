import React, { useCallback, useEffect, useRef } from 'react';

import { Page } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { CONNECTION_TIMEOUT, MSG_TIMEOUT_ERROR, UPDATE_INTERVAL } from './App.constant';
import { ErrorTypes } from './App.enum';
import { useConnectionErrType, useDataVAN, useSiteInfo } from './contexts/Data';
import AppContent from './layout/AppContent';
import Header from './layout/Header';
import SideBar from './layout/SideBar';
import { RESTServices } from './models/services/REST';
import LoadingPage from './pages/Loading/Loading';
import Routes from './routes';
import { RoutesPaths } from './routes/routes.enum';
import { wait } from './utils/wait';

import './App.scss';

function App() {
  const prevDataVan = useRef({});
  const fetchDataTimerId = useRef(-1);

  const { connectionErrType, setConnectionErrType } = useConnectionErrType();
  const { dataVAN, setDataVAN } = useDataVAN();
  const { setSiteInfo } = useSiteInfo();

  const navigate = useNavigate();

  const handleFetchData = useCallback(async () => {
    try {
      const data = await Promise.race([
        RESTServices.fetchData(),
        wait(CONNECTION_TIMEOUT, ErrorTypes.Server),
      ]);

      if (data === ErrorTypes.Server) {
        throw new Error(MSG_TIMEOUT_ERROR);
      }

      if (typeof data !== 'string') {
        const { data: dataVan, siteInfo } = data;
        if (dataVan && JSON.stringify(dataVan) !== JSON.stringify(prevDataVan.current)) {
          prevDataVan.current = dataVan;
          setDataVAN(dataVan);
          setSiteInfo(siteInfo);
          setConnectionErrType('');
        }
      }
    } catch ({ httpStatus, message }) {
      const type = httpStatus ? ErrorTypes.Server : ErrorTypes.Connection;

      setConnectionErrType(type);
      clearInterval(fetchDataTimerId.current);
    }
  }, [setConnectionErrType, setDataVAN, setSiteInfo]);

  useEffect(() => {
    if (connectionErrType) {
      const route =
        connectionErrType === ErrorTypes.Server ? RoutesPaths.ErrServer : RoutesPaths.ErrConnection;
      navigate(route);
    }
  }, [connectionErrType, navigate]);

  useEffect(() => {
    handleFetchData();
    fetchDataTimerId.current = window.setInterval(handleFetchData, UPDATE_INTERVAL);
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
