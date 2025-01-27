import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import MetricFilters from './components/Filters';
import Latency from './components/Latency';
import Request from './components/Request';
import Response from './components/Response';
import TcpConnection from './components/TcpConnection';
import Traffic from './components/Traffic';
import { useMetricsState } from './hooks/useMetricsState';
import { Protocols } from '../../../API/REST.enum';
import { Labels } from '../../../config/labels';
import { hexColors } from '../../../config/styles';
import { ConfigMetricFilters, QueryMetricsParams } from '../../../types/Metrics.interfaces';

export interface MetricsProps {
  sessionKey?: string; //Used to Save filters to local storage, allowing the selected filters to persist across page reloads.
  defaultMetricFilterValues: QueryMetricsParams;
  sourceSites?: { id: string; destinationName: string }[];
  destSites?: { id: string; destinationName: string }[];
  sourceProcesses?: { id: string; destinationName: string; parentId?: string; parentName?: string }[];
  destProcesses?: { id: string; destinationName: string; parentId?: string; parentName?: string }[];
  availableProtocols?: Protocols[];
  configFilters?: ConfigMetricFilters;
}
//ExpandedMetricSections
const Metrics: FC<MetricsProps> = function (props) {
  const {
    sessionKey,
    configFilters,
    defaultMetricFilterValues,
    sourceSites,
    destSites,
    sourceProcesses,
    destProcesses,
    availableProtocols
  } = props;

  const { selectedFilters, handleFilterChange } = useMetricsState({
    sessionKey,
    defaultMetricFilterValues
  });

  const showHttp = !!availableProtocols?.includes(Protocols.Http) || !!availableProtocols?.includes(Protocols.Http2);

  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: hexColors.White }}>
        <MetricFilters
          configFilters={configFilters}
          defaultMetricFilterValues={selectedFilters}
          sourceSites={sourceSites}
          destSites={destSites}
          sourceProcesses={sourceProcesses}
          destProcesses={destProcesses}
          onSelectFilters={handleFilterChange}
        />
      </div>

      <Stack hasGutter>
        <StackItem>
          <Traffic selectedFilters={selectedFilters} />
        </StackItem>

        <StackItem>
          <TcpConnection selectedFilters={selectedFilters} />
        </StackItem>

        <StackItem>
          <Latency title={Labels.Latency} selectedFilters={selectedFilters} />
        </StackItem>

        {showHttp && (
          <>
            <StackItem>
              <Request selectedFilters={selectedFilters} />
            </StackItem>

            <StackItem>
              <Response selectedFilters={selectedFilters} />
            </StackItem>
          </>
        )}
      </Stack>
    </>
  );
};

export default Metrics;
