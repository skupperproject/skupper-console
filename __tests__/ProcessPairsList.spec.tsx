import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processesPairsData from '../mocks/data/PROCESS_PAIRS.json';
import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import { extendedProcessResponse } from '../mocks/server.API';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import { SkEmptyDataLabels } from '../src/core/components/SkEmptyData';
import LoadingPage from '../src/core/components/SkLoading';
import PairsList from '../src/pages/Processes/components/PairsList';
import { ProcessesRoutesPaths } from '../src/pages/Processes/Processes.enum';
import { Providers } from '../src/providers';
import { ProcessResponse, PairsResponse } from '../src/types/REST.interfaces';

const data = processesData.results[0] as extendedProcessResponse;
const dataNoPairs = {
  endTime: 0,
  identity: 'no-pairs',
  name: 'no-pairs',
  startTime: 1728076321000000
} as ProcessResponse;

const processPairsResult = processesPairsData.results[17] as PairsResponse;

describe('Process Pairs List component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('Should ensure the Process associated renders with correct link href after loading page', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <PairsList process={data} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByRole('link', { name: Labels.ViewDetails })[1]).toHaveAttribute(
      'href',
      `#${ProcessesRoutesPaths.Processes}/${processPairsResult.sourceName}@${processPairsResult.sourceId}/${Labels.Pairs}@${processPairsResult.identity}?type=${Labels.Pairs}`
    );
  });

  it('Should handle the empty case', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <PairsList process={dataNoPairs} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(SkEmptyDataLabels.Default)).toBeInTheDocument();
  });
});
