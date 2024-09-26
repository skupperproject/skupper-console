import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { SkEmptyDataLabels } from '@core/components/SkEmptyData';

import pairsList from '../../../mocks/data/PROCESS_GROUP_PAIRS.json';
import components from '../../../mocks/data/PROCESS_GROUPS.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import PairsList from '../../../src/pages/ProcessGroups/components/PairList';
import LoadingPage from '../../../src/pages/shared/Loading';
import { ComponentResponse, BasePairs } from '../../../src/types/REST.interfaces';

const data = components.results[0] as ComponentResponse;
const dataNoPairs = components.results[6] as ComponentResponse;
const pairs = pairsList.results[1] as BasePairs;

describe('Component Pairs Llist component', () => {
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
          <PairsList component={data} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByText(pairs.destinationName)[0]).toBeInTheDocument();
  });

  it('Should handle the empty case', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <PairsList component={dataNoPairs} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(SkEmptyDataLabels.Default)).toBeInTheDocument();
  });
});
