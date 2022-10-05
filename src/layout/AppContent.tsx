import React from 'react';

interface AppContentProps {
    children: React.ReactNode;
}

const AppContent = function ({ children }: AppContentProps) {
    return (
        <div className="pf-u-px-md pf-u-py-md" style={{ flex: 1, overflow: 'hidden' }}>
            {children}
        </div>
    );
};

export default AppContent;
