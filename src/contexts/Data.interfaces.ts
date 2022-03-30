import React from 'react';

import { SiteInfoData } from '@models/services/REST.interfaces';

export interface GlobalStateProviderProps {
  children: React.ReactNode;
}
export interface ConnectionSiteInfoState {
  siteInfo: SiteInfoData | null;
  setSiteInfo: Function;
}
