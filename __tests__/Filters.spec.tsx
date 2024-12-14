import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../mocks/data/PROCESSES.json';
import siteData from '../mocks/data/SITES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import MetricFilters from '../src/pages/shared/Metrics/components/Filters';
import { Labels } from '../src/config/labels';

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
        destSites={[{ destinationName: siteData.results[2].name }, { destinationName: siteData.results[1].name }]}
        sourceProcesses={[
          { destinationName: processesData.results[0].name },
          { destinationName: processesData.results[1].name }
        ]}
        destProcesses={[
          { destinationName: processesData.results[2].name },
          { destinationName: processesData.results[3].name }
        ]}
        configFilters={{
          destinationProcesses: { disabled: false, placeholder: Labels.AllConnectedProcesses },
          sourceProcesses: { disabled: false, placeholder: Labels.AllSourceProcesses },
          protocols: { disabled: false, placeholder: Labels.AllProtocols }
        }}
        defaultMetricFilterValues={{ sourceProcess: undefined }}
        isRefetching={false}
        onRefetch={onRefetch}
        onSelectFilters={() => {}}
      />
    );

    fireEvent.click(screen.getByText(Labels.AllSourceProcesses));
    await waitFor(() => expect(screen.getByText(processesData.results[0].name)).toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(processesData.results[0].name));
    await waitFor(() => expect(screen.queryByText(Labels.AllSourceProcesses)).not.toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(Labels.AllConnectedProcesses));
    await waitFor(() => expect(screen.getByText(processesData.results[3].name)).toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(processesData.results[3].name));
    await waitFor(() => expect(screen.queryByText(Labels.AllConnectedProcesses)).not.toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(Labels.AllSourceSites));
    await waitFor(() => expect(screen.getByText(siteData.results[0].name)).toBeInTheDocument()),
      {
        timeout: waitForElementToBeRemovedTimeout
      };

    fireEvent.click(screen.getByText(siteData.results[0].name));
    await waitFor(() => expect(screen.queryByText(Labels.AllSourceSites)).not.toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });
  });

  it('should render the Metric Filter 2', async () => {
    const onRefetch = jest.fn();

    render(
      <MetricFilters
        sourceSites={[{ destinationName: siteData.results[0].name }, { destinationName: siteData.results[1].name }]}
        destSites={[{ destinationName: siteData.results[2].name }, { destinationName: siteData.results[1].name }]}
        sourceProcesses={[
          { destinationName: processesData.results[0].name },
          { destinationName: processesData.results[1].name }
        ]}
        destProcesses={[
          { destinationName: processesData.results[2].name },
          { destinationName: processesData.results[3].name }
        ]}
        configFilters={{
          destinationProcesses: { disabled: false, placeholder: Labels.AllConnectedProcesses },
          sourceProcesses: { disabled: false, placeholder: Labels.AllSourceProcesses },
          protocols: { disabled: false, placeholder: Labels.AllProtocols }
        }}
        defaultMetricFilterValues={{ sourceProcess: undefined }}
        isRefetching={false}
        onRefetch={onRefetch}
        onSelectFilters={() => {}}
      />
    );

    fireEvent.click(screen.getByText(Labels.AllConnectedSites));
    await waitFor(() => expect(screen.getByText(siteData.results[2].name)).toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(siteData.results[2].name));
    await waitFor(() => expect(screen.queryByText(Labels.AllConnectedSites)).not.toBeInTheDocument(), {
      timeout: waitForElementToBeRemovedTimeout
    });
  });
});
