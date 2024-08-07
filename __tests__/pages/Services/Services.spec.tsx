import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import servicesData from '../../../mocks/data/SERVICES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import Services from '../../../src/pages/Services/views/Services';
import LoadingPage from '../../../src/pages/shared/Loading';

const servicesResults = servicesData.results;
const service = servicesResults[0];

describe('Begin testing the Service component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Services />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Services view after the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
    expect(screen.getByTestId(getTestsIds.servicesView())).toBeInTheDocument();
  });

  it('should render a table with the Services data after the data has loaded.', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(service.name)).toBeInTheDocument();
    expect(screen.getAllByText(service.protocol)[0]).toBeInTheDocument();
    expect(screen.getAllByText(service.connectorCount)[0]).toBeInTheDocument();
  });

  it('Should ensure the Services component renders with correct Name link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByRole('link', { name: service.name })).toHaveAttribute(
      'href',
      `#/services/${service.name}@${service.identity}@${service.protocol}`
    );
  });
});
