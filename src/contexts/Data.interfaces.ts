import React from 'react';

import { SiteInfo } from '@models/services/REST.interfaces';

export interface GlobalStateProviderProps {
  children: React.ReactNode;
}
export interface ConnectionSiteInfoState {
  siteInfo: SiteInfo | null;
  setSiteInfo: Function;
}
