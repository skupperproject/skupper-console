import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { AvailableProtocols } from '@API/REST.enum';
import { ProcessResponse } from '@API/REST.interfaces';
import { timeIntervalMap } from '@config/prometheus';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import Metrics from '../index';
import { displayIntervalMap } from '../Metrics.constants';
import { MetricsLabels } from '../Metrics.enum';

const processResult = processesData.results[0] as ProcessResponse;

describe('Metrics component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Metrics with all sections opened', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Metrics
            selectedFilters={{
              processIdSource: processResult.name
            }}
            processesConnected={[
              { destinationName: processesData.results[2].name },
              { destinationName: processesData.results[3].name }
            ]}
            openSections={{ latency: true, request: true }}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(MetricsLabels.DataTransferTitle)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.LatencyTitle)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.RequestsTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllDestinationProcesses));
    fireEvent.click(screen.getByText(processesData.results[2].name));

    fireEvent.click(screen.getByText(displayIntervalMap[0].label));
    fireEvent.click(screen.getByText(displayIntervalMap[1].label));

    fireEvent.click(screen.getByText(timeIntervalMap.oneMinute.label));
    fireEvent.click(screen.getByText(timeIntervalMap.fiveMinutes.label));

    fireEvent.click(screen.getByText(MetricsLabels.FilterProtocolsDefault));
    fireEvent.click(screen.getByText(AvailableProtocols.Http2));
  });
});
