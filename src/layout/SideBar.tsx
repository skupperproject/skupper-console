import { PageSidebar } from '@patternfly/react-core';

import NavBar from '@core/components/NavBar';

const SideBar = function () {
  return <PageSidebar style={{ width: 120 }} nav={<NavBar />} />;
};

export default SideBar;
