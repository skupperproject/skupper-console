import { fireEvent, render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { AvailableProtocols } from '@API/REST.enum';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';

import MetricFilters from '../components/Filters';
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
      <MetricFilters
        sourceProcesses={[
          { destinationName: processesData.results[0].name },
          { destinationName: processesData.results[1].name }
        ]}
        destProcesses={[
          { destinationName: processesData.results[2].name },
          { destinationName: processesData.results[3].name }
        ]}
        availableProtocols={[AvailableProtocols.Http, AvailableProtocols.Http2, AvailableProtocols.Tcp]}
        configFilters={{
          destinationProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationProcesses },
          sourceProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllSourceProcesses },
          protocols: { disabled: false, placeholder: MetricsLabels.FilterProtocolsDefault }
        }}
        defaultMetricFilterValues={{ sourceProcess: undefined }}
        startTimeLimit={0}
        isRefetching={false}
        onRefetch={onRefetch}
        onSelectFilters={() => {}}
      />
    );

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllSourceSites));
    fireEvent.click(screen.getByText(MetricsLabels.FilterAllDestinationSites));
    fireEvent.click(screen.getByText(MetricsLabels.FilterAllSourceProcesses));
    fireEvent.click(screen.getByText(processesData.results[0].name));
    fireEvent.click(screen.getByText(MetricsLabels.FilterAllDestinationProcesses));
    fireEvent.click(screen.getByText(processesData.results[2].name));
    fireEvent.click(screen.getByText(MetricsLabels.FilterProtocolsDefault));
    fireEvent.click(screen.getByText(AvailableProtocols.Http2));
  });
});
