import React from 'react';

import { Outlet } from 'react-router-dom';

import AppContent from '@layout/AppContent';

const Topology = function () {
    return (
        <AppContent>
            <Outlet />
        </AppContent>
    );
};

export default Topology;
