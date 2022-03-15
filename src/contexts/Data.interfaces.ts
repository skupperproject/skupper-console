import React from 'react';

import { DataVAN, SiteInfo } from '../models/services/REST.interfaces';

export interface GlobalStateProviderProps {
  children: React.ReactNode;
}

export interface ConnectionDataVANState {
  dataVAN: DataVAN | null;
  setDataVAN: Function;
}

export interface ConnectionSiteInfoState {
  siteInfo: SiteInfo | null;
  setSiteInfo: Function;
}

export interface ConnectionErrTypeState {
  connectionErrType: string;
  setConnectionErrType: Function;
}

export interface ConnectionErrMsgState {
  connectionErrMsg: string;
  setConnectionErrMsg: Function;
}
