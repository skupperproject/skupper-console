import React from 'react';

import { Outlet } from 'react-router-dom';

import AppContent from '@layout/AppContent';

const Network = function () {
    return (
        <AppContent>
            <Outlet />
        </AppContent>
    );
};

export default Network;
