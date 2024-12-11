import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processPairsData from '../../../mocks/data/PROCESS_PAIRS.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/app';
import { getTestsIds } from '../../../src/config/testIds';
import LoadingPage from '../../../src/core/components/SkLoading';
import { Providers } from '../../../src/providers';
import { ProcessesLabels } from '../../../src/pages/Processes/Processes.enum';
import ProcessPair, { ProcessPairContent } from '../../../src/pages/Processes/views/ProcessPair';
import { PairsResponse } from '../../../src/types/REST.interfaces';
import { setMockUseParams } from '../../../jest.mock.router';

const processPairsResultOpToCart = processPairsData.results[0] as PairsResponse; // HTTP2 flow
const processPairsResultDatabaseToPayment = processPairsData.results[6] as PairsResponse; // old TCP flow and active TCP flow
const processPairsResultPayment2toCatalog = processPairsData.results[18] as PairsResponse; // old TCP flow

setMockUseParams({ id: `${'test'}@${processPairsResultOpToCart.identity}` });

describe('Begin testing the Processes component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the ProcessPairs view after the data loading is complete', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPair />
        </Suspense>
      </Providers>
    );

    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
    expect(screen.getByTestId(getTestsIds.processPairsView(processPairsResultOpToCart.identity))).toBeInTheDocument();
  });

  it('should render render the HTTP2 Process Pairs Content Component', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPairContent id={processPairsResultOpToCart.identity} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByTestId(ProcessesLabels.Requests)).toBeInTheDocument();
  });

  it('should render render the TCP Process Pairs Content Component and the tab Open connection is active', async () => {
    const { queryByTestId, getByTestId } = render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPairContent id={processPairsResultDatabaseToPayment.identity} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(getByTestId(ProcessesLabels.OpenConnections)).toBeInTheDocument();
  });

  it('should render render the TCP Process Pairs Content Component and the Tab connection history is active', async () => {
    const { queryByTestId, getByText, getByTestId } = render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPairContent id={processPairsResultPayment2toCatalog.identity} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(getByText(ProcessesLabels.TerminatedConnections));

    expect(getByTestId(ProcessesLabels.TerminatedConnections)).toBeInTheDocument();
  });
});
