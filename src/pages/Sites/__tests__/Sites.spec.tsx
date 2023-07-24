import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import sitesData from '@mocks/data/SITES.json';
import { MockApiPaths, MockApi, loadMockServer } from '@mocks/server';
import { ErrorRoutesPaths } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import Sites from '../views/Sites';

const siteResults = sitesData.results;

describe('Begin testing the Sites component', () => {
  let server: Server;
  const mockedNavigator = jest.fn();

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Sites />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render a loading page when data is loading', () => {
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
  });

  it('should render the sites view after the data loading is complete', async () => {
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByTestId(getTestsIds.sitesView())).toBeInTheDocument();
  });

  it('should render a table with the site data after the data has loaded.', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(siteResults[0].name)).toBeInTheDocument();
  });

  it('Should ensure the Sites component renders with correct link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByRole('link', { name: siteResults[0].name })).toHaveAttribute(
      'href',
      `#/sites/${siteResults[0].name}@${siteResults[0].identity}`
    );
  });

  it('Should call the useNavigate function with the path to an error page when a 404 error is received from sites', async () => {
    server.get(MockApiPaths.Sites, MockApi.get404Error);
    jest.spyOn(router, 'useNavigate').mockImplementation(() => mockedNavigator);

    render(
      <Wrapper
        config={{
          defaultOptions: {
            queries: {
              retry: false
            }
          }
        }}
      >
        <Suspense fallback={<LoadingPage />}>
          <Sites />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(mockedNavigator).toHaveBeenCalledWith(ErrorRoutesPaths.error.HttpError, {
      state: { code: 'ERR_BAD_REQUEST', message: '404: Not Found' }
    });
  });

  it('Should call the useNavigate function with the path to an error page when a 500 error is received from sites', async () => {
    server.get(MockApiPaths.Sites, MockApi.get500Error);
    jest.spyOn(router, 'useNavigate').mockImplementation(() => mockedNavigator);

    render(
      <Wrapper
        config={{
          defaultOptions: {
            queries: {
              retry: false
            }
          }
        }}
      >
        <Suspense fallback={<LoadingPage />}>
          <Sites />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(mockedNavigator).toHaveBeenCalledWith(ErrorRoutesPaths.error.HttpError, {
      state: { code: 'ERR_BAD_RESPONSE', message: '500: Internal Server Error' }
    });
  });
});
