import { createRoot } from 'react-dom/client';

import App from './App';
import { Wrapper } from './core/components/Wrapper';

const rootElement = document.getElementById('app') as HTMLDivElement;
createRoot(rootElement).render(
  <Wrapper>
    <App />
  </Wrapper>
);

if (!process.env.COLLECTOR_URL && (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER)) {
  const mockServer = require('../mocks/server');

  mockServer.loadMockServer();
}
