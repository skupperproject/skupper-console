import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { setMockUseParams } from '../jest.setup';
import componentsData from '../mocks/data/COMPONENTS.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import Component from '../src/pages/Components/views/Component';
import { Providers } from '../src/providers';
import { ComponentResponse } from '../src/types/REST.interfaces';

const componentResults = componentsData.results as ComponentResponse[];

setMockUseParams({ id: `${componentResults[0].name}@${componentResults[0].identity}` });

describe('Component component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

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

    expect(screen.getByText(Labels.TcpTraffic)).toBeInTheDocument();
  });

  it('should render the title, description data and processes associated the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getAllByText(Labels.Processes)[0]);

    expect(screen.getAllByRole('sk-heading')[0]).toHaveTextContent(componentResults[0].name);
  });
});
