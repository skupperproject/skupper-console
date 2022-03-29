import React, { createContext, useMemo, useState } from 'react';

import { ConnectionSiteInfoState, GlobalStateProviderProps } from './Data.interfaces';

// Initial States
const siteInfoInitialState = {
  siteInfo: null,
  setSiteInfo: () => null,
};

// Contexts
const SiteInfoContext = createContext<ConnectionSiteInfoState>(siteInfoInitialState);

// Provider
const GlobalStateProvider = function ({ children }: GlobalStateProviderProps) {
  const [siteInfo, setSiteInfo] = useState(siteInfoInitialState.siteInfo);

  // Contexts values
  const siteInfoContextValue = useMemo(() => ({ siteInfo, setSiteInfo }), [siteInfo]);

  return (
    <SiteInfoContext.Provider value={siteInfoContextValue}>{children}</SiteInfoContext.Provider>
  );
};

// custom hooks
//const useSiteInfo = () => useContext(SiteInfoContext);

export default GlobalStateProvider;
