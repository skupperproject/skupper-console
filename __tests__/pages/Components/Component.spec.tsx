import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import componentsData from '../../../mocks/data/COMPONENTS.json';
import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/app';
import { getTestsIds } from '../../../src/config/testIds';
import LoadingPage from '../../../src/core/components/SkLoading';
import { Providers } from '../../../src/providers';
import { ComponentLabels } from '../../../src/pages/Components/Components.enum';
import Component from '../../../src/pages/Components/views/Component';
import { MetricsLabels } from '../../../src/pages/shared/Metrics/Metrics.enum';
import { ProcessResponse, ComponentResponse } from '../../../src/types/REST.interfaces';
import { ProcessesRoutesPaths } from '../../../src/pages/Processes/Processes.enum';

const componentResults = componentsData.results as ComponentResponse[];
const processResults = processesData.results as ProcessResponse[];

describe('Component component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    // Mock URL query parameters and inject them into the component
    jest
      .spyOn(router, 'useParams')
      .mockReturnValue({ id: `${componentResults[0].name}@${componentResults[0].identity}` });

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Component />
        </Suspense>
      </Providers>
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

    expect(screen.getByTestId(getTestsIds.componentView(componentResults[0].identity))).toBeInTheDocument();
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

    expect(screen.getAllByRole('sk-heading')[0]).toHaveTextContent(componentResults[0].name);
    //expect(screen.getByText(processResults[8].name)).toBeInTheDocument();
  });

  // it('Should ensure the Component details component renders with correct link href after loading page', async () => {
  //   await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
  //     timeout: waitForElementToBeRemovedTimeout
  //   });

  //   fireEvent.click(screen.getAllByText(ComponentLabels.Processes)[0]);

  //   expect(screen.getByRole('link', { name: processResults[8].name })).toHaveAttribute(
  //     'href',
  //     `#${ProcessesRoutesPaths.Processes}/${processResults[8].name}@${processResults[8].identity}`
  //   );
  // });
});
