import React from 'react';

interface AppContentProps {
  children: React.ReactNode;
}

const AppContent = ({ children }: AppContentProps) => {
  return <div className="pf-u-p-md pf-u-h-100">{children}</div>;
};

export default AppContent;
