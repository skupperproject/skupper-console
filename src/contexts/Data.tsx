import React, { createContext, useMemo, useState, useContext } from 'react';

import { ConnectionSiteInfoState, GlobalStateProviderProps } from './Data.interfaces';

//Initial States
const siteInfoInitialState = { siteInfo: null, setSiteInfo: () => null };

// Contexts
const SiteInfoContext = createContext<ConnectionSiteInfoState>(siteInfoInitialState);

//Provider
const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  const [siteInfo, setSiteInfo] = useState(siteInfoInitialState.siteInfo);

  // Contexts values
  const siteInfoContextValue = useMemo(() => ({ siteInfo, setSiteInfo }), [siteInfo]);

  return (
    <SiteInfoContext.Provider value={siteInfoContextValue}>{children}</SiteInfoContext.Provider>
  );
};

// custom hooks
export const useSiteInfo = () => useContext(SiteInfoContext);

export default GlobalStateProvider;
