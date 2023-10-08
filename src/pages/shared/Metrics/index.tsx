import { FC, useCallback, useRef, useState } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { AvailableProtocols } from '@API/REST.enum';

import MetricFilters from './components/Filters';
import Latency from './components/Latency';
import Request from './components/Request';
import Traffic from './components/Traffic';
import { MetricsProps, QueryMetricsParams } from './Metrics.interfaces';

const Metrics: FC<MetricsProps> = function ({
  configFilters, // General configuration for filters (e.g., hide/show, enable/disable)
  defaultMetricFilterValues, // Initial values when the component mounts for filters
  defaultOpenSections, // Initial values when the component mounts for opened/closed metric sections
  sourceSites, // List of source sites used to populate the filter options
  destSites, // List of destination sites used in the filter
  sourceProcesses, // List of source processes for filtering
  destProcesses, // List of destination processes for filtering
  availableProtocols, // List of available protocols for filtering
  startTimeLimit, // Use startTimeLimit to set the left temporal limit of the SelectTimeInterval filter
  onGetMetricFilters, // Function to retrieve the filter configuration
  onGetExpandedSectionsConfig // Function to retrieve the open/close status of metric sections
}) {
  const { refreshDataInterval: defaultRefreshDataInterval, ...filters } = defaultMetricFilterValues;

  const [queryParams, setQueryParams] = useState<QueryMetricsParams>(filters);
  const [refetchInterval, setRefetchInterval] = useState(defaultRefreshDataInterval);
  const [shouldUpdateData, setShouldUpdateData] = useState(0);
  // keep track of the the open/close status sections
  const expandedSectionsConfigRef = useRef(defaultOpenSections);

  //Filters: refetch manually the prometheus API
  const handleShouldUpdateData = useCallback(() => {
    setShouldUpdateData(new Date().getTime());
  }, []);

  // Filters: Set the prometheus query params with the filter values
  const handleUpdateQueryParams = useCallback(
    (updatedFilters: QueryMetricsParams, refreshDataInterval?: number) => {
      setRefetchInterval(refreshDataInterval);
      setQueryParams(updatedFilters);
      if (onGetMetricFilters) {
        onGetMetricFilters({ ...updatedFilters, refreshDataInterval });
      }
    },
    [onGetMetricFilters]
  );

  const handleUpdateExpandedSections = useCallback(
    (section: Record<string, boolean>) => {
      if (onGetExpandedSectionsConfig) {
        const config = { ...expandedSectionsConfigRef.current, ...section };

        onGetExpandedSectionsConfig(config);
        expandedSectionsConfigRef.current = config;
      }
    },
    [onGetExpandedSectionsConfig]
  );

  // case: We select TCP from the protocol filter or the protocol list has only 1 item and this item is TCP
  const isOnlyTcp =
    queryParams.protocol !== AvailableProtocols.Tcp &&
    !(availableProtocols?.length === 1 && availableProtocols[0] === AvailableProtocols.Tcp);

  return (
    <Stack hasGutter>
      <StackItem style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <MetricFilters
          configFilters={configFilters}
          defaultMetricFilterValues={defaultMetricFilterValues}
          defaultRefreshDataInterval={defaultRefreshDataInterval}
          sourceSites={sourceSites}
          destSites={destSites}
          sourceProcesses={sourceProcesses}
          destProcesses={destProcesses}
          availableProtocols={availableProtocols}
          startTimeLimit={startTimeLimit}
          onRefetch={handleShouldUpdateData}
          onSelectFilters={handleUpdateQueryParams}
        />
      </StackItem>

      <StackItem>
        <Traffic
          selectedFilters={queryParams}
          forceUpdate={shouldUpdateData}
          refetchInterval={refetchInterval}
          openSections={defaultOpenSections?.byterate}
          onGetIsSectionExpanded={handleUpdateExpandedSections}
        />
      </StackItem>

      {isOnlyTcp && (
        <>
          <StackItem>
            <Latency
              selectedFilters={queryParams}
              openSections={defaultOpenSections?.latency}
              forceUpdate={shouldUpdateData}
              refetchInterval={refetchInterval}
              onGetIsSectionExpanded={handleUpdateExpandedSections}
            />
          </StackItem>

          <StackItem>
            <Request
              selectedFilters={queryParams}
              openSections={defaultOpenSections?.request}
              forceUpdate={shouldUpdateData}
              refetchInterval={refetchInterval}
              onGetIsSectionExpanded={handleUpdateExpandedSections}
            />
          </StackItem>
        </>
      )}
    </Stack>
  );
};

export default Metrics;
