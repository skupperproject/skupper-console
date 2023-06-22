import { PageSidebar } from '@patternfly/react-core';
import { auto } from '@patternfly/react-core/dist/esm/helpers/Popper/thirdparty/popper-core';

import NavBar from '@core/components/NavBar';

const SideBar = function () {
  return <PageSidebar style={{ width: auto }} nav={<NavBar />} />;
};

export default SideBar;
