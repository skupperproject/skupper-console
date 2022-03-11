import React, { createContext, useMemo, useState, useContext } from 'react';

import { GlobalStateProviderProps } from './Data.interfaces';

//Initial States
const dataVANInitialState: any = { dataVAN: null, setDataVAN: undefined } as any;
const connectionErrTypeInitialState: any = {
  connectionErrType: '',
  setConnectionErrType: undefined,
};
const connectionErrMsgInitialState: any = {
  connectionErrMsg: '',
  setConnectionErrMsg: undefined,
};

// Contexts
const DataVANContext = createContext(dataVANInitialState);
const ConnectionErrTypeContext = createContext(connectionErrTypeInitialState);
const ConnectionErrMsgContext = createContext(connectionErrMsgInitialState);

//Provider
const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  const [dataVAN, setDataVAN] = useState(dataVANInitialState.dataVAN);
  const [connectionErrType, setConnectionErrType] = useState(
    connectionErrTypeInitialState.connectionErrType,
  );
  const [connectionErrMsg, setConnectionErrMsg] = useState(
    connectionErrMsgInitialState.connectionErrMessage,
  );

  // Contexts values
  const dataVANContextValue = useMemo(() => ({ dataVAN, setDataVAN }), [dataVAN]);
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
        <DataVANContext.Provider value={dataVANContextValue}>{children}</DataVANContext.Provider>
      </ConnectionErrMsgContext.Provider>
    </ConnectionErrTypeContext.Provider>
  );
};

// custom hooks
export const useDataVAN = () => useContext(DataVANContext);
export const useDataServices = () => useContext(DataVANContext);
export const useConnectionErrMsg = () => useContext(ConnectionErrMsgContext);
export const useConnectionErrType = () => useContext(ConnectionErrTypeContext);

export default GlobalStateProvider;
