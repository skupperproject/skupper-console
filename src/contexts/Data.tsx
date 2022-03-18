import React, { createContext, useMemo, useState, useContext } from 'react';

import {
  ConnectionErrMsgState,
  ConnectionErrTypeState,
  ConnectionIsLoadingDataState,
  ConnectionSiteInfoState,
  GlobalStateProviderProps,
} from './Data.interfaces';

//Initial States
const siteInfoInitialState = { siteInfo: null, setSiteInfo: () => null };
const isLoadingDataInitialState = {
  isLoadingData: null,
  setIsLoadingData: () => null,
};

const connectionErrTypeInitialState = {
  connectionErrType: '',
  setConnectionErrType: () => null,
};
const connectionErrMsgInitialState = {
  connectionErrMsg: '',
  setConnectionErrMsg: () => null,
};

// Contexts
const SiteInfoContext = createContext<ConnectionSiteInfoState>(siteInfoInitialState);
const IsLoadingDataContext = createContext<ConnectionIsLoadingDataState>(isLoadingDataInitialState);

const ConnectionErrTypeContext = createContext<ConnectionErrTypeState>(
  connectionErrTypeInitialState,
);
const ConnectionErrMsgContext = createContext<ConnectionErrMsgState>(connectionErrMsgInitialState);

//Provider
const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  const [siteInfo, setSiteInfo] = useState(siteInfoInitialState.siteInfo);
  const [isLoadingData, setIsLoadingData] = useState(isLoadingDataInitialState.isLoadingData);
  const [connectionErrType, setConnectionErrType] = useState(
    connectionErrTypeInitialState.connectionErrType,
  );
  const [connectionErrMsg, setConnectionErrMsg] = useState(
    connectionErrMsgInitialState.connectionErrMsg,
  );

  // Contexts values
  const siteInfoContextValue = useMemo(() => ({ siteInfo, setSiteInfo }), [siteInfo]);
  const isLoadingDataContextValue = useMemo(
    () => ({ isLoadingData, setIsLoadingData }),
    [isLoadingData],
  );
  const connectionErrTypeContextValue = useMemo(
    () => ({
      connectionErrType,
      setConnectionErrType,
    }),
    [connectionErrType],
  );
  const connectionErrMsgContextValue = useMemo(
    () => ({
      connectionErrMsg,
      setConnectionErrMsg,
    }),
    [connectionErrMsg],
  );

  return (
    <ConnectionErrTypeContext.Provider value={connectionErrTypeContextValue}>
      <ConnectionErrMsgContext.Provider value={connectionErrMsgContextValue}>
        <IsLoadingDataContext.Provider value={isLoadingDataContextValue}>
          <SiteInfoContext.Provider value={siteInfoContextValue}>
            {children}
          </SiteInfoContext.Provider>
        </IsLoadingDataContext.Provider>
      </ConnectionErrMsgContext.Provider>
    </ConnectionErrTypeContext.Provider>
  );
};

// custom hooks
export const useSiteInfo = () => useContext(SiteInfoContext);
export const useIsLoadingData = () => useContext(IsLoadingDataContext);
export const useConnectionErrMsg = () => useContext(ConnectionErrMsgContext);
export const useConnectionErrType = () => useContext(ConnectionErrTypeContext);

export default GlobalStateProvider;
