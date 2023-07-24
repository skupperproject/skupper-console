import { createRoot } from 'react-dom/client';

import { Wrapper } from '@core/components/Wrapper';
import App from 'App';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/components/Button/button.css';
import '@patternfly/patternfly/components/Card/card.css';
import '@patternfly/patternfly/components/Divider/divider.css';
import '@patternfly/patternfly/components/Form/form.css';
import '@patternfly/patternfly/components/FormControl/form-control.css';
import '@patternfly/patternfly/components/Nav/nav.css';
import '@patternfly/patternfly/components/Page/page.css';
import '@patternfly/patternfly/components/Pagination/pagination.css';
import '@patternfly/patternfly/components/Panel/panel.css';
import '@patternfly/patternfly/components/Select/select.css';
import '@patternfly/patternfly/components/SearchInput/search-input.css';
import '@patternfly/patternfly/components/Sidebar/sidebar.css';
import '@patternfly/patternfly/components/Table/table.css';
import '@patternfly/patternfly/components/Tabs/tabs.css';
import '@patternfly/patternfly/components/Toolbar/toolbar.css';
import '@patternfly/patternfly/components/Tooltip/tooltip.css';
import '@patternfly/patternfly/components/Truncate/truncate.css';

import './App.css';

const rootElement = document.getElementById('app') as HTMLDivElement;
const root = createRoot(rootElement);

root.render(
  <Wrapper>
    <App />
  </Wrapper>
);

if (!process.env.COLLECTOR_URL && (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER)) {
  const mockServer = require('../mocks/server');

  mockServer.loadMockServer();
}
