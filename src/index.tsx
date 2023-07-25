import { createRoot } from 'react-dom/client';

import { Wrapper } from '@core/components/Wrapper';
import App from 'App';

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
