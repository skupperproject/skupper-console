import React, { useCallback, useEffect, useRef } from 'react';

import { Page } from '@patternfly/react-core';

import { CONNECT_TIMEOUT, MSG_TIMEOUT_ERROR, UPDATE_INTERVAL } from './App.constant';
import { ErrorTypes } from './App.enum';
import { useConnectionErrMsg, useConnectionErrType, useDataVAN } from './contexts/Data';
import AppContent from './layout/AppContent';
import Header from './layout/Header';
import SideBar from './layout/SideBar';
import LoadingPage from './pages/Loading/Loading';
import Routes from './routes';
import restService from './services/REST';

import './App.scss';

function App() {
  const prevDataVan = useRef(null);
  const { connectionErrType, setConnectionErrType } = useConnectionErrType();
  const { setConnectionErrMsg } = useConnectionErrMsg();
  const { dataVAN, setDataVAN } = useDataVAN();

  const setConnectTimeout = useCallback(() => {
    setConnectionErrType(ErrorTypes.Timeout);
    setConnectionErrMsg(MSG_TIMEOUT_ERROR);
  }, [setConnectionErrMsg, setConnectionErrType]);

  const handleFetchData = useCallback(async () => {
    const connectTimer: number = window.setTimeout(setConnectTimeout, CONNECT_TIMEOUT);

    try {
      const data = await restService.fetchData();
      if (JSON.stringify(data) !== JSON.stringify(prevDataVan.current)) {
        prevDataVan.current = data;
        setDataVAN(data);
        setConnectionErrType('');
      }
    } catch (error: any) {
      setConnectionErrType(ErrorTypes.HTTP);
      setConnectionErrMsg(error);
    } finally {
      clearTimeout(connectTimer);
    }
  }, [setConnectTimeout, setConnectionErrMsg, setConnectionErrType, setDataVAN]);

  useEffect(() => {
    handleFetchData();
    setInterval(handleFetchData, UPDATE_INTERVAL);
  }, [handleFetchData]);

  return (
    <Page header={<Header />} sidebar={<SideBar />} isManagedSidebar>
      <AppContent>
        {!dataVAN && !connectionErrType && <LoadingPage />}
        {dataVAN && <Routes />}
      </AppContent>
    </Page>
  );
}

export default App;
