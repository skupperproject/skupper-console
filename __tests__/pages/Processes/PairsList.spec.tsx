import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';


import processesPairsData from '../../../mocks/data/PROCESS_PAIRS.json';
import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/app';
import { getTestsIds } from '../../../src/config/testIds';
import { SkEmptyDataLabels } from '../../../src/core/components/SkEmptyData';
import LoadingPage from '../../../src/core/components/SkLoading';
import { Wrapper } from '../../../src/core/components/Wrapper';
import PairsList from '../../../src/pages/Processes/components/PairsList';
import { ProcessesLabels, ProcessesRoutesPaths } from '../../../src/pages/Processes/Processes.enum';
import { ProcessResponse, PairsResponse } from '../../../src/types/REST.interfaces';

const data = processesData.results[7] as ProcessResponse;
const dataNoPairs = processesData.results[9] as ProcessResponse;
const processPairsResult = processesPairsData.results[6] as PairsResponse;

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
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <PairsList process={data} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByRole('link', { name: ProcessesLabels.GoToDetailsLink })[1]).toHaveAttribute(
      'href',
      `#${ProcessesRoutesPaths.Processes}/${processPairsResult.sourceName}@${processPairsResult.sourceId}/${ProcessesLabels.ProcessPairs}@${processPairsResult.identity}?type=${ProcessesLabels.ProcessPairs}`
    );
  });

  it('Should handle the empty case', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <PairsList process={dataNoPairs} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(SkEmptyDataLabels.Default)).toBeInTheDocument();
  });
});
