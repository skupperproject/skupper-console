import { createRoot } from 'react-dom/client';

import App from './App';
import { Providers } from './providers';

import '@patternfly/react-core/dist/styles/base.css';

const rootElement = document.getElementById('app') as HTMLDivElement;
createRoot(rootElement).render(
  <Providers>
    <App />
  </Providers>
);

if (!process.env.COLLECTOR_URL && (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER)) {
  import('../mocks/server')
    .then((module) => {
      module.loadMockServer();
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error loading mock server:', error);
    });
}
