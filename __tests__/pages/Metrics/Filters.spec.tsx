import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../../../mocks/data/PROCESSES.json';
import siteData from '../../../mocks/data/SITES.json';
import { loadMockServer } from '../../../mocks/server';
import { Protocols } from '../../../src/API/REST.enum';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import MetricFilters from '../../../src/pages/shared/Metrics/components/Filters';
import { MetricsLabels } from '../../../src/pages/shared/Metrics/Metrics.enum';

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
        availableProtocols={[Protocols.Http, Protocols.Http2, Protocols.Tcp]}
        configFilters={{
          destinationProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationProcesses },
          sourceProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllSourceProcesses },
          protocols: { disabled: false, placeholder: MetricsLabels.FilterProtocolsDefault }
        }}
        defaultMetricFilterValues={{ sourceProcess: undefined }}
        isRefetching={false}
        onRefetch={onRefetch}
        onSelectFilters={() => {}}
      />
    );

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllSourceProcesses));
    await waitFor(() => expect(screen.getByText(processesData.results[0].name)).toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(processesData.results[0].name));
    await waitFor(() => expect(screen.queryByText(MetricsLabels.FilterAllSourceProcesses)).not.toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllDestinationProcesses));
    await waitFor(() => expect(screen.getByText(processesData.results[3].name)).toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(processesData.results[3].name));
    await waitFor(
      () => expect(screen.queryByText(MetricsLabels.FilterAllDestinationProcesses)).not.toBeInTheDocument(),
      {
        timeout: waitForElementToBeRemovedTimeout
      }
    );

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllSourceSites));
    await waitFor(() => expect(screen.getByText(siteData.results[0].name)).toBeInTheDocument()),
      {
        timeout: waitForElementToBeRemovedTimeout
      };

    fireEvent.click(screen.getByText(siteData.results[0].name));
    await waitFor(() => expect(screen.queryByText(MetricsLabels.FilterAllSourceSites)).not.toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });
  });

  it('should render the Metric Filter 2', async () => {
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
        availableProtocols={[Protocols.Http, Protocols.Http2, Protocols.Tcp]}
        configFilters={{
          destinationProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationProcesses },
          sourceProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllSourceProcesses },
          protocols: { disabled: false, placeholder: MetricsLabels.FilterProtocolsDefault }
        }}
        defaultMetricFilterValues={{ sourceProcess: undefined }}
        isRefetching={false}
        onRefetch={onRefetch}
        onSelectFilters={() => {}}
      />
    );

    fireEvent.click(screen.getByText(MetricsLabels.FilterAllDestinationSites));
    await waitFor(() => expect(screen.getByText(siteData.results[3].name)).toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(siteData.results[3].name));
    await waitFor(() => expect(screen.queryByText(MetricsLabels.FilterAllDestinationSites)).not.toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(MetricsLabels.FilterProtocolsDefault));
    await waitFor(() => expect(screen.getByText(Protocols.Http2)).toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(Protocols.Http2));
    await waitFor(() => expect(screen.queryByText(MetricsLabels.FilterProtocolsDefault)).not.toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });
  });
});
