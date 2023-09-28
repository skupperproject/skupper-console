import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { AvailableProtocols } from '@API/REST.enum';
import { timeIntervalMap } from '@config/prometheus';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import MetricFilters from '../Filters';
import { displayIntervalMap } from '../Metrics.constants';
import { MetricsLabels } from '../Metrics.enum';

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

  it('should render the Metric Filter', async () => {
    const onRefetch = jest.fn();

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <MetricFilters
            sourceProcesses={[
              { destinationName: processesData.results[0].name },
              { destinationName: processesData.results[1].name }
            ]}
            processesConnected={[
              { destinationName: processesData.results[2].name },
              { destinationName: processesData.results[3].name }
            ]}
            availableProtocols={[AvailableProtocols.Http, AvailableProtocols.Http2, AvailableProtocols.Tcp]}
            customFilterOptions={{
              destinationProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationProcesses },
              sourceProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllSourceProcesses },
              protocols: { disabled: false, placeholder: MetricsLabels.FilterProtocolsDefault },
              timeIntervals: { disabled: false }
            }}
            initialFilters={{ sourceProcess: undefined }}
            startTime={0}
            isRefetching={false}
            forceDisableRefetchData={true}
            onRefetch={onRefetch}
            onSelectFilters={() => {}}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()));

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllSourceProcesses));
    fireEvent.click(screen.getByText(processesData.results[0].name));

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllDestinationProcesses));
    fireEvent.click(screen.getByText(processesData.results[2].name));

    fireEvent.click(screen.getByText(displayIntervalMap[0].label));
    fireEvent.click(screen.getByText(displayIntervalMap[1].label));

    fireEvent.click(screen.getByText(timeIntervalMap.oneMinute.label));
    fireEvent.click(screen.getByText(timeIntervalMap.fiveMinutes.label));

    fireEvent.click(screen.getByText(MetricsLabels.FilterProtocolsDefault));
    fireEvent.click(screen.getByText(AvailableProtocols.Http2));

    fireEvent.click(screen.getByTestId('metric-refetch'));
  });
});
