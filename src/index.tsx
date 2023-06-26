import { createRoot } from 'react-dom/client';

import { Wrapper } from '@core/components/Wrapper';
import App from 'App';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/components/Button/button.css';
import '@patternfly/patternfly/components/Toolbar/toolbar.css';
import '@patternfly/patternfly/components/Nav/nav.css';
import '@patternfly/patternfly/components/Page/page.css';
import '@patternfly/patternfly/components/Tooltip/tooltip.css';
import '@patternfly/patternfly/components/Table/table.css';

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
