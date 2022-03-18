import React from 'react';

import { SiteInfo } from '../models/services/REST.interfaces';

export interface GlobalStateProviderProps {
  children: React.ReactNode;
}

export interface ConnectionSiteInfoState {
  siteInfo: SiteInfo | null;
  setSiteInfo: Function;
}

export interface ConnectionIsLoadingDataState {
  isLoadingData: boolean | null;
  setIsLoadingData: Function;
}

export interface ConnectionErrTypeState {
  connectionErrType: string;
  setConnectionErrType: Function;
}

export interface ConnectionErrMsgState {
  connectionErrMsg: string;
  setConnectionErrMsg: Function;
}
