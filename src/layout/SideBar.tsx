import React from 'react';

import { PageSidebar } from '@patternfly/react-core';

import NavBar from '@core/components/NavBar';

const SideBar = function () {
    return <PageSidebar className="pf-u-w-auto" nav={<NavBar />} theme="dark" />;
};

export default SideBar;
