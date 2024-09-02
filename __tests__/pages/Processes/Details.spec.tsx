import { Suspense } from 'react';

import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import { Wrapper } from '../../../src/core/components/Wrapper';
import Details from '../../../src/pages/Processes/components/Details';
import LoadingPage from '../../../src/pages/shared/Loading';
import { ProcessResponse } from '../../../src/types/REST.interfaces';

const processResult = processesData.results[0] as ProcessResponse;

describe('Process component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    // Mock URL query parameters and inject them into the component
    jest.spyOn(router, 'useParams').mockReturnValue({ id: `${processResult.name}@${processResult.identity}` });

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Details process={processResult} />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the title, description data and processes associated the data loading is complete', async () => {
    expect(screen.getByText(processResult.parentName)).toHaveTextContent('site 1');
    expect(screen.getByText(processResult.groupName)).toHaveTextContent('payment');
    expect(screen.getByText(processResult.hostName)).toHaveTextContent('10.242.0.5');
    expect(screen.getByText(processResult.sourceHost)).toHaveTextContent('172.17.63.163');
  });
});
