import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import { extendedProcessResponse } from '../mocks/server.API';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import Process from '../src/pages/Processes/views/Process';
import { Providers } from '../src/providers';

const processResult = processesData.results[0] as extendedProcessResponse;

describe('Process component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    // Mock URL query parameters and inject them into the component
    jest.spyOn(router, 'useParams').mockReturnValue({ id: `${processResult.name}@${processResult.identity}` });

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Process />
        </Suspense>
      </Providers>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Process view after the data loading is complete', async () => {
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByTestId(getTestsIds.processView(processResult.identity))).toBeInTheDocument();
    expect(screen.getAllByRole('sk-heading')[0]).toHaveTextContent(processResult.name);

    fireEvent.click(screen.getByText(Labels.Details));
    expect(screen.getByText(Labels.Details).closest('li')?.classList.contains('pf-m-current'));

    fireEvent.click(screen.getByText(Labels.Pairs));
    expect(screen.getByText(Labels.Pairs).closest('li')?.classList.contains('pf-m-current'));
  });
});
