import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { SkEmptyDataLabels } from '@core/components/SkEmptyData';

import pairsList from '../../../mocks/data/SITE_PAIRS.json';
import sites from '../../../mocks/data/SITES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import LoadingPage from '../../../src/pages/shared/Loading';
import PairsList from '../../../src/pages/Sites/components/PairList';
import { BasePairs, SiteResponse } from '../../../src/types/REST.interfaces';

const data = sites.results[0] as SiteResponse;
const dataNoPairs = sites.results[4] as SiteResponse;
const pairs = pairsList.results[0] as BasePairs;

describe('Site Pairs List component', () => {
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
          <PairsList site={data} />
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
          <PairsList site={dataNoPairs} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(SkEmptyDataLabels.Default)).toBeInTheDocument();
  });
});
