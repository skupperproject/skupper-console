import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import sitesData from '@mocks/data/SITES.json';
import { MockApiPaths, MockApi, loadMockServer } from '@mocks/server';
import { ErrorConnectionRoutesPaths } from '@pages/shared/Errors/Connection/Connection.enum';
import { ErrorServerRoutesPaths } from '@pages/shared/Errors/Server/Server.enum';

import Sites from '../views/Sites';

const siteResults = sitesData.results;

describe('Begin testing the Sites component', () => {
  let server: Server;
  const mockedNavigator = jest.fn();

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
        <Sites />
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
  });

  it('should render the sites view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <Sites />
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByTestId(getTestsIds.sitesView())).toBeInTheDocument();
  });

  it('should render a table with the site data after the data has loaded.', async () => {
    render(
      <Wrapper>
        <Sites />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(siteResults[0].name)).toBeInTheDocument();
  });

  it('Should ensure the Sites component renders with correct link href after loading page', async () => {
    render(
      <Wrapper>
        <Sites />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByRole('link', { name: siteResults[0].name })).toHaveAttribute(
      'href',
      `#/sites/${siteResults[0].name}@${siteResults[0].identity}`
    );
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
        <Sites />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(mockedNavigator).toHaveBeenCalledWith(ErrorServerRoutesPaths.ErrServer);
  });

  it('Should call the useNavigate function with the path to an error page when a connection error is received from sites', async () => {
    server.get(MockApiPaths.Sites, MockApi.getConnectionError);
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
        <Sites />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(mockedNavigator).toHaveBeenCalledWith(ErrorConnectionRoutesPaths.ErrConnection);
  });
});
