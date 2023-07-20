import { PageSidebar } from '@patternfly/react-core';

import NavBar from '@core/components/NavBar';

const SideBar = function () {
  return <PageSidebar nav={<NavBar />} />;
};

export default SideBar;
