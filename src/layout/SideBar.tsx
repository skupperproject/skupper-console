import { PageSidebar } from '@patternfly/react-core';

import NavBar from '@core/components/NavBar';

import './Layout.css';

const SideBar = function () {
  return <PageSidebar className="pf-u-w-auto" nav={<NavBar />} />;
};

export default SideBar;
