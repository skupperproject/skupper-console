import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { Protocols, Direction } from '@API/REST.enum';
import { ConfigMetricFilters, ExpandedMetricSections, QueryMetricsParams } from '@sk-types/Metrics.interfaces';

import MetricFilters from './components/Filters';
import Latency from './components/Latency';
import Request from './components/Request';
import Response from './components/Response';
import TcpConnection from './components/TcpConnection';
import Traffic from './components/Traffic';
import { useMetricsState } from './hooks/useMetricsState';
import { MetricsLabels } from './Metrics.enum';

export interface MetricsProps {
  defaultMetricFilterValues: QueryMetricsParams;
  defaultOpenSections?: ExpandedMetricSections;
  sourceSites?: { destinationName: string }[];
  destSites?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string; siteName?: string }[];
  destProcesses?: { destinationName: string; siteName?: string }[];
  availableProtocols?: Protocols[];
  configFilters?: ConfigMetricFilters;
  onGetMetricFiltersConfig?: Function;
  onGetExpandedSectionsConfig?: Function;
}

const Metrics: FC<MetricsProps> = function (props) {
  const {
    configFilters,
    defaultMetricFilterValues,
    defaultOpenSections,
    sourceSites,
    destSites,
    sourceProcesses,
    destProcesses,
    availableProtocols,
    onGetMetricFiltersConfig,
    onGetExpandedSectionsConfig
  } = props;

  const { queryParams, shouldUpdateData, triggerMetricUpdate, handleFilterChange, handleSectionToggle } =
    useMetricsState({
      defaultMetricFilterValues,
      defaultOpenSections,
      onGetMetricFiltersConfig,
      onGetExpandedSectionsConfig
    });

  return (
    <Stack hasGutter>
      <StackItem style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <MetricFilters
          configFilters={configFilters}
          defaultMetricFilterValues={defaultMetricFilterValues}
          sourceSites={sourceSites}
          destSites={destSites}
          sourceProcesses={sourceProcesses}
          destProcesses={destProcesses}
          availableProtocols={availableProtocols}
          onRefetch={triggerMetricUpdate}
          onSelectFilters={handleFilterChange}
        />
      </StackItem>
      <StackItem>
        <Traffic
          selectedFilters={queryParams}
          forceUpdate={shouldUpdateData}
          openSections={defaultOpenSections?.byterate}
          onGetIsSectionExpanded={handleSectionToggle}
        />
      </StackItem>
      <StackItem>
        <TcpConnection
          selectedFilters={queryParams}
          forceUpdate={shouldUpdateData}
          openSections={defaultOpenSections?.connection}
          onGetIsSectionExpanded={handleSectionToggle}
        />
      </StackItem>

      <StackItem>
        <Latency
          title={MetricsLabels.LatencyTitleOut}
          description={MetricsLabels.LatencyDescriptionOut}
          selectedFilters={{ ...queryParams, direction: Direction.Incoming }}
          openSections={defaultOpenSections?.latency}
          forceUpdate={shouldUpdateData}
          onGetIsSectionExpanded={handleSectionToggle}
        />
      </StackItem>

      <StackItem>
        <Latency
          title={MetricsLabels.LatencyTitleIn}
          description={MetricsLabels.LatencyDescriptionIn}
          selectedFilters={{ ...queryParams, direction: Direction.Outgoing }}
          openSections={defaultOpenSections?.latency}
          forceUpdate={shouldUpdateData}
          onGetIsSectionExpanded={handleSectionToggle}
        />
      </StackItem>

      <>
        <StackItem>
          <Request
            selectedFilters={queryParams}
            openSections={defaultOpenSections?.request}
            forceUpdate={shouldUpdateData}
            onGetIsSectionExpanded={handleSectionToggle}
          />
        </StackItem>
        <StackItem>
          <Response
            selectedFilters={queryParams}
            openSections={defaultOpenSections?.response}
            forceUpdate={shouldUpdateData}
            onGetIsSectionExpanded={handleSectionToggle}
          />
        </StackItem>
      </>
    </Stack>
  );
};

export default Metrics;
