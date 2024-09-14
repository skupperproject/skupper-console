import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import processesPairsData from '../../../mocks/data/PROCESS_PAIRS.json';
import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import ProcessPairsList from '../../../src/pages/Processes/components/ProcessPairsList';
import { ProcessesLabels, ProcessesRoutesPaths } from '../../../src/pages/Processes/Processes.enum';
import LoadingPage from '../../../src/pages/shared/Loading';
import { ProcessPairsResponse, ProcessResponse, SitePairsResponse } from '../../../src/types/REST.interfaces';

const processResult = processesData.results[7] as ProcessResponse;
const processPairsResult = processesPairsData.results[6] as ProcessPairsResponse | SitePairsResponse;

describe('Processes Pairs component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    // Mock URL query parameters and inject them into the component
    jest.spyOn(router, 'useParams').mockReturnValue({ id: `${processResult.name}@${processResult.identity}` });

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPairsList process={processResult} />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('Should ensure the Process associated renders with correct link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByRole('link', { name: 'view pairs' })[1]).toHaveAttribute(
      'href',
      `#${ProcessesRoutesPaths.Processes}/${processPairsResult.sourceName}@${processPairsResult.sourceId}/${ProcessesLabels.ProcessPairs}@${processPairsResult.identity}?type=${ProcessesLabels.ProcessPairs}`
    );
  });
});
