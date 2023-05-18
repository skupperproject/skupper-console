import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { ProcessResponse, ProcessGroupResponse } from '@API/REST.interfaces';
import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/Wrapper';
import processGroupsData from '@mocks/data/PROCESS_GROUPS.json';
import processesData from '@mocks/data/PROCESSES.json';
import { MockApi, MockApiPaths, loadMockServer } from '@mocks/server';
import { ErrorServerRoutesPaths } from '@pages/shared/Errors/Server/Server.enum';

import ProcessGroup from '../views/ProcessGroup';

const processGroupResults = processGroupsData.results as ProcessGroupResponse[];
const processResults = processesData.results as ProcessResponse[];

describe('Component component', () => {
  let server: Server;
  const mockedNavigator = jest.fn();

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    // Mock URL query parameters and inject them into the component
    jest
      .spyOn(router, 'useParams')
      .mockReturnValue({ id: `${processGroupResults[0].name}@${processGroupResults[0].identity}` });
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Component view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <ProcessGroup />
      </Wrapper>
    );
    // Wait for all queries to resolve
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByTestId(getTestsIds.componentView(processGroupResults[0].identity))).toBeInTheDocument();
  });

  it('should render the title, description data and processes associated the data loading is complete', async () => {
    render(
      <Wrapper>
        <ProcessGroup />
      </Wrapper>
    );
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByRole('sk-heading')).toHaveTextContent(processGroupResults[0].name);
    expect(screen.getByText(processResults[0].name)).toBeInTheDocument();
  });

  it('Should ensure the Component details component renders with correct link href after loading page', async () => {
    render(
      <Wrapper>
        <ProcessGroup />
      </Wrapper>
    );
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByRole('link', { name: processResults[0].name })).toHaveAttribute(
      'href',
      `#/processes/${processResults[0].name}@${processResults[0].identity}`
    );
  });

  it('Should call the useNavigate function with the path to an error page when a 500 error is received from the Component details', async () => {
    server.get(MockApiPaths.Component, MockApi.get500Error);
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
        <ProcessGroup />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(mockedNavigator).toHaveBeenCalledWith(ErrorServerRoutesPaths.ErrServer);
  });
});