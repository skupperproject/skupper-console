import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import { ErrorBoundary } from 'react-error-boundary';

import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import sitesData from '@mocks/data/SITES.json';
import { MockApiPaths, MockApi, loadMockServer } from '@mocks/server';
import ErrorConsole from '@pages/shared/Errors/Console';
import LoadingPage from '@pages/shared/Loading';

import Sites from '../views/Sites';

const siteResults = sitesData.results;

describe('Begin testing the Sites component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render a loading page when data is loading', () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Sites />
        </Suspense>
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
  });

  it('should render the sites view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Sites />
        </Suspense>
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByTestId(getTestsIds.sitesView())).toBeInTheDocument();
  });

  it('should render a table with the site data after the data has loaded.', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Sites />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(siteResults[0].name)).toBeInTheDocument();
  });

  it('Should ensure the Sites component renders with correct link href after loading page', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Sites />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByRole('link', { name: siteResults[0].name })).toHaveAttribute(
      'href',
      `#/sites/${siteResults[0].name}@${siteResults[0].identity}`
    );
  });

  it('Should call the useNavigate function with the path to an error page when a 404 error is received from sites', async () => {
    server.get(MockApiPaths.Sites, MockApi.get404Error);
    // removes an expected error boundary console.error from react query
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Wrapper
        config={{
          defaultOptions: {
            queries: {
              retry: false,
              throwOnError: true
            }
          }
        }}
      >
        <ErrorBoundary FallbackComponent={ErrorConsole}>
          <Suspense fallback={<LoadingPage />}>
            <Sites />
          </Suspense>
        </ErrorBoundary>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText('ERR_BAD_REQUEST')).toBeInTheDocument();
  });

  it('Should call the useNavigate function with the path to an error page when a 500 error is received from sites', async () => {
    server.get(MockApiPaths.Sites, MockApi.get500Error);
    // removes an expected error boundary console.error from react query
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Wrapper
        config={{
          defaultOptions: {
            queries: {
              retry: false,
              throwOnError: true
            }
          }
        }}
      >
        <ErrorBoundary FallbackComponent={ErrorConsole}>
          <Suspense fallback={<LoadingPage />}>
            <Sites />
          </Suspense>
        </ErrorBoundary>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText('ERR_BAD_RESPONSE')).toBeInTheDocument();
  });
});
