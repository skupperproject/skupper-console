import { FC, useCallback, useRef, useState, startTransition } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { AvailableProtocols, Direction } from '@API/REST.enum';
import { ConfigMetricFilters, ExpandedMetricSections, QueryMetricsParams } from '@sk-types/Metrics.interfaces';

import MetricFilters from './components/Filters';
import Latency from './components/Latency';
import Request from './components/Request';
import Response from './components/Response';
import TcpConnection from './components/TcpConnection';
import Traffic from './components/Traffic';
import { MetricsLabels } from './Metrics.enum';

interface UseMetricsProps {
  defaultMetricFilterValues: QueryMetricsParams;
  defaultOpenSections?: ExpandedMetricSections;
  onGetMetricFiltersConfig?: Function;
  onGetExpandedSectionsConfig?: Function;
}

export const useMetrics = ({
  defaultMetricFilterValues,
  defaultOpenSections,
  onGetMetricFiltersConfig,
  onGetExpandedSectionsConfig
}: UseMetricsProps) => {
  const { ...filters } = defaultMetricFilterValues;
  const [queryParams, setQueryParams] = useState<QueryMetricsParams>(filters);
  const [shouldUpdateData, setShouldUpdateData] = useState(0);
  const expandedSectionsConfigRef = useRef(defaultOpenSections);

  const triggerMetricUpdate = () => {
    setShouldUpdateData(new Date().getTime());
  };

  const handleFilterChange = useCallback(
    (updatedFilters: QueryMetricsParams) => {
      startTransition(() => {
        setQueryParams(updatedFilters);
      });

      if (onGetMetricFiltersConfig) {
        onGetMetricFiltersConfig({ ...updatedFilters });
      }
    },
    [onGetMetricFiltersConfig]
  );

  const handleSectionToggle = useCallback(
    (section: Record<string, boolean>) => {
      if (onGetExpandedSectionsConfig) {
        const config = { ...expandedSectionsConfigRef.current, ...section };
        onGetExpandedSectionsConfig(config);
        expandedSectionsConfigRef.current = config;
      }
    },
    [onGetExpandedSectionsConfig]
  );

  return {
    queryParams,
    shouldUpdateData,
    triggerMetricUpdate,
    handleFilterChange,
    handleSectionToggle
  };
};

export interface MetricsProps {
  defaultMetricFilterValues: QueryMetricsParams;
  defaultOpenSections?: ExpandedMetricSections;
  sourceSites?: { destinationName: string }[];
  destSites?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string; siteName?: string }[];
  destProcesses?: { destinationName: string; siteName?: string }[];
  availableProtocols?: AvailableProtocols[];
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

  const { queryParams, shouldUpdateData, triggerMetricUpdate, handleFilterChange, handleSectionToggle } = useMetrics({
    defaultMetricFilterValues,
    defaultOpenSections,
    onGetMetricFiltersConfig,
    onGetExpandedSectionsConfig
  });
  // case: hide if We select TCP from the protocol filter or the protocol list has only 1 item and this item is TCP
  const showHttp =
    !!availableProtocols?.length &&
    queryParams.protocol !== AvailableProtocols.Tcp &&
    !(availableProtocols?.length === 1 && availableProtocols[0] === AvailableProtocols.Tcp);
  const showTcp = !queryParams.protocol || queryParams.protocol === AvailableProtocols.Tcp;

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
      {showTcp && (
        <StackItem>
          <TcpConnection
            selectedFilters={queryParams}
            forceUpdate={shouldUpdateData}
            openSections={defaultOpenSections?.connection}
            onGetIsSectionExpanded={handleSectionToggle}
          />
        </StackItem>
      )}
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
      {showHttp && (
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
      )}
    </Stack>
  );
};

export default Metrics;
