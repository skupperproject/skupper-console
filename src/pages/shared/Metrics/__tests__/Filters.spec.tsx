import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';

import { AvailableProtocols } from '@API/REST.enum';
import processesData from '@mocks/data/PROCESSES.json';
import siteData from '@mocks/data/SITES.json';
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
        sourceSites={[{ destinationName: siteData.results[0].name }, { destinationName: siteData.results[1].name }]}
        destSites={[{ destinationName: siteData.results[2].name }, { destinationName: siteData.results[3].name }]}
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

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllSourceProcesses));
    await waitFor(() => expect(screen.getByText(processesData.results[0].name)).toBeInTheDocument());

    fireEvent.click(screen.getByText(processesData.results[0].name));
    await waitFor(() => expect(screen.queryByText(MetricsLabels.FilterAllSourceProcesses)).not.toBeInTheDocument());

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllDestinationProcesses));
    await waitFor(() => expect(screen.getByText(processesData.results[3].name)).toBeInTheDocument());

    fireEvent.click(screen.getByText(processesData.results[3].name));
    await waitFor(() =>
      expect(screen.queryByText(MetricsLabels.FilterAllDestinationProcesses)).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllSourceSites));
    await waitFor(() => expect(screen.getByText(siteData.results[0].name)).toBeInTheDocument());

    fireEvent.click(screen.getByText(siteData.results[0].name));
    await waitFor(() => expect(screen.queryByText(MetricsLabels.FilterAllSourceSites)).not.toBeInTheDocument());

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllDestinationSites));
    await waitFor(() => expect(screen.getByText(siteData.results[3].name)).toBeInTheDocument());

    fireEvent.click(screen.getByText(siteData.results[3].name));
    await waitFor(() => expect(screen.queryByText(MetricsLabels.FilterAllDestinationSites)).not.toBeInTheDocument());

    fireEvent.click(screen.getByText(MetricsLabels.FilterProtocolsDefault));
    await waitFor(() => expect(screen.getByText(AvailableProtocols.Http2)).toBeInTheDocument());

    fireEvent.click(screen.getByText(AvailableProtocols.Http2));
    await waitFor(() => expect(screen.queryByText(MetricsLabels.FilterProtocolsDefault)).not.toBeInTheDocument());
  });
});
