import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { AvailableProtocols } from '@API/REST.enum';
import { ProcessPairsResponse, SitePairsResponse } from '@API/REST.interfaces';
import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processPairsData from '@mocks/data/PROCESS_PAIRS.json';
import { loadMockServer } from '@mocks/server';
import ProcessPairs, { ProcessPairsContent } from '@pages/Processes/views/ProcessPairs';
import LoadingPage from '@pages/shared/Loading';

const processPairsResultOpToCart = processPairsData.results[0] as ProcessPairsResponse | SitePairsResponse; // HTTP2 flow
const processPairsResultDatabaseToPayment = processPairsData.results[6] as ProcessPairsResponse | SitePairsResponse; // old TCP flow and active TCP flow
const processPairsResultPayment2ToOp = processPairsData.results[4] as ProcessPairsResponse | SitePairsResponse; // old TCP flow

describe('Begin testing the Processes component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    jest
      .spyOn(router, 'useParams')
      .mockReturnValue({ processPair: `${'test'}@${processPairsResultOpToCart.identity}` });
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the ProcessPairs view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPairs />
        </Suspense>
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
    expect(screen.getByTestId(getTestsIds.processPairsView(processPairsResultOpToCart.identity))).toBeInTheDocument();
  });

  it('should render render the HTTP2 Process Pairs Content Component', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPairsContent
            processPairId={processPairsResultOpToCart.identity}
            sourceId={processPairsResultOpToCart.sourceId}
            destinationId={processPairsResultOpToCart.destinationId}
            protocol={AvailableProtocols.Http2}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByTestId('http2-table')).toBeInTheDocument();
  });

  it('should render render the TCP Process Pairs Content Component and the tab Open connection is active', async () => {
    const { queryByTestId, getByTestId } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPairsContent
            processPairId={processPairsResultDatabaseToPayment.identity}
            sourceId={processPairsResultDatabaseToPayment.sourceId}
            destinationId={processPairsResultDatabaseToPayment.destinationId}
            protocol={AvailableProtocols.Tcp}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(getByTestId('tcp-active-connections-table')).toBeInTheDocument();
  });

  it('should render render the TCP Process Pairs Content Component and the Tab connection history is active', async () => {
    const { queryByTestId, getByText, getByTestId } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPairsContent
            processPairId={processPairsResultPayment2ToOp.identity}
            sourceId={processPairsResultPayment2ToOp.sourceId}
            destinationId={processPairsResultPayment2ToOp.destinationId}
            protocol={AvailableProtocols.Tcp}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(getByText('Connection history (1)'));

    expect(getByTestId('tcp-old-connections-table')).toBeInTheDocument();
  });
});
