import React from 'react';

export interface GlobalStateProviderProps {
  children: React.ReactNode;
}

export interface ConnectionDataVANState {
  dataVAN: any;
  setDataVAN: Function;
}

export interface ConnectionErrTypeState {
  connectionErrType: string;
  setConnectionErrType: Function;
}

export interface ConnectionErrMsgState {
  connectionErrMsg: string;
  setConnectionErrMsg: Function;
}
