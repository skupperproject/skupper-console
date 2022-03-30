import React from 'react';

export interface GlobalStateProviderProps {
  children: React.ReactNode;
}
export interface ConnectionSiteInfoState {
  siteInfo: any | null;
  setSiteInfo: Function;
}
