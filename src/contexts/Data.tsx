import React, { createContext, useMemo, useState, useContext } from 'react';

import {
  ConnectionDataVANState,
  ConnectionErrMsgState,
  ConnectionErrTypeState,
  ConnectionSiteInfoState,
  GlobalStateProviderProps,
} from './Data.interfaces';

//Initial States
const dataVANInitialState = { dataVAN: null, setDataVAN: () => null };
const siteInfoInitialState = { siteInfo: null, setSiteInfo: () => null };

const connectionErrTypeInitialState = {
  connectionErrType: '',
  setConnectionErrType: () => null,
};
const connectionErrMsgInitialState = {
  connectionErrMsg: '',
  setConnectionErrMsg: () => null,
};

// Contexts
const DataVANContext = createContext<ConnectionDataVANState>(dataVANInitialState);
const SiteInfoContext = createContext<ConnectionSiteInfoState>(siteInfoInitialState);
const ConnectionErrTypeContext = createContext<ConnectionErrTypeState>(
  connectionErrTypeInitialState,
);
const ConnectionErrMsgContext = createContext<ConnectionErrMsgState>(connectionErrMsgInitialState);

//Provider
const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  const [dataVAN, setDataVAN] = useState(dataVANInitialState.dataVAN);
  const [siteInfo, setSiteInfo] = useState(siteInfoInitialState.siteInfo);
  const [connectionErrType, setConnectionErrType] = useState(
    connectionErrTypeInitialState.connectionErrType,
  );
  const [connectionErrMsg, setConnectionErrMsg] = useState(
    connectionErrMsgInitialState.connectionErrMsg,
  );

  // Contexts values
  const dataVANContextValue = useMemo(() => ({ dataVAN, setDataVAN }), [dataVAN]);
  const siteInfoContextValue = useMemo(() => ({ siteInfo, setSiteInfo }), [siteInfo]);
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
        <SiteInfoContext.Provider value={siteInfoContextValue}>
          <DataVANContext.Provider value={dataVANContextValue}>{children}</DataVANContext.Provider>
        </SiteInfoContext.Provider>
      </ConnectionErrMsgContext.Provider>
    </ConnectionErrTypeContext.Provider>
  );
};

// custom hooks
export const useDataVAN = () => useContext(DataVANContext);
export const useSiteInfo = () => useContext(SiteInfoContext);
export const useDataServices = () => useContext(DataVANContext);
export const useConnectionErrMsg = () => useContext(ConnectionErrMsgContext);
export const useConnectionErrType = () => useContext(ConnectionErrTypeContext);

export default GlobalStateProvider;
