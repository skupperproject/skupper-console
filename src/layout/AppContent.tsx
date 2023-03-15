import React from 'react';

import { AnimatePresence } from 'framer-motion';
import { useRoutes, RouteObject } from 'react-router-dom';

import BrandImg from '@assets/skupper-logo-full.svg';

interface AppContentProps {
  children: RouteObject[];
}

const AppContent = function ({ children }: AppContentProps) {
  const appRoutes = useRoutes([...children, { path: '/', element: children[0].element }]);

  if (!appRoutes) {
    return null;
  }

  return (
    <div className="pf-u-px-md pf-u-py-md" style={{ flex: 1 }}>
      <img src={BrandImg} alt="skupper brand" className="sk-main" />
      <div style={{ position: 'relative', height: '100%' }}>
        <AnimatePresence mode="wait">{appRoutes}</AnimatePresence>
      </div>
    </div>
  );
};

export default AppContent;
