import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import Services from '../views/Services';

const servicesResults = servicesData.results;

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
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    expect(screen.getByTestId(getTestsIds.servicesView())).toBeInTheDocument();
  });

  it('should render a table with the Services data after the data has loaded.', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(servicesResults[0].name)).toBeInTheDocument();
    expect(screen.getAllByText(servicesResults[0].protocol)[0]).toBeInTheDocument();
    expect(screen.getAllByText(servicesResults[0].connectorCount)[0]).toBeInTheDocument();
  });

  it('Should ensure the Services component renders with correct Name link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByRole('link', { name: servicesResults[0].name })).toHaveAttribute(
      'href',
      `#/services/${servicesResults[0].name}@${servicesResults[0].identity}@${servicesResults[0].protocol}`
    );
  });
});
