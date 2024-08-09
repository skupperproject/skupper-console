import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import processGroupsData from '../../../mocks/data/PROCESS_GROUPS.json';
import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import { ProcessResponse, ComponentResponse } from '../../../src/API/REST.interfaces';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import { ComponentLabels } from '../../../src/pages/ProcessGroups/ProcessGroups.enum';
import ProcessGroup from '../../../src/pages/ProcessGroups/views/ProcessGroup';
import LoadingPage from '../../../src/pages/shared/Loading';
import { MetricsLabels } from '../../../src/pages/shared/Metrics/Metrics.enum';

const processGroupResults = processGroupsData.results as ComponentResponse[];
const processResults = processesData.results as ProcessResponse[];

describe('Component component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    // Mock URL query parameters and inject them into the component
    jest
      .spyOn(router, 'useParams')
      .mockReturnValue({ id: `${processGroupResults[0].name}@${processGroupResults[0].identity}` });

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ProcessGroup />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Component view after the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByTestId(getTestsIds.componentView(processGroupResults[0].identity))).toBeInTheDocument();
  });

  it('should render the default view and show the message for empty metrics', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(MetricsLabels.DataTransferTitle)).toBeInTheDocument();
  });

  it('should render the title, description data and processes associated the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getAllByText(ComponentLabels.Processes)[0]);

    expect(screen.getAllByRole('sk-heading')[0]).toHaveTextContent(processGroupResults[0].name);
    expect(screen.getByText(processResults[0].name)).toBeInTheDocument();
  });

  it('Should ensure the Component details component renders with correct link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getAllByText(ComponentLabels.Processes)[0]);

    expect(screen.getByRole('link', { name: processResults[0].name })).toHaveAttribute(
      'href',
      `#/processes/${processResults[0].name}@${processResults[0].identity}`
    );
  });
});
