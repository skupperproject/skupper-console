import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import MetricFilters from './components/Filters';
import Latency from './components/Latency';
import Request from './components/Request';
import Response from './components/Response';
import TcpConnection from './components/TcpConnection';
import Traffic from './components/Traffic';
import { useMetricSessionHandlers } from './hooks/useMetricsSessionHandler';
import { useMetricsState } from './hooks/useMetricsState';
import { Protocols, Direction } from '../../../API/REST.enum';
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
  const { selectedFilters, openSections, setSelectedFilters, setOpenSections } = useMetricSessionHandlers(
    sessionKey,
    defaultMetricFilterValues
  );

  const { shouldUpdateData, triggerMetricUpdate, handleFilterChange, handleSectionToggle } = useMetricsState({
    selectedFilters,
    openSections,
    setSelectedFilters,
    setOpenSections
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
          onRefetch={triggerMetricUpdate}
          onSelectFilters={handleFilterChange}
        />
      </div>

      <Stack hasGutter>
        <StackItem>
          <Traffic
            selectedFilters={selectedFilters}
            forceUpdate={shouldUpdateData}
            openSections={openSections?.byterate}
            onGetIsSectionExpanded={handleSectionToggle}
          />
        </StackItem>

        <StackItem>
          <TcpConnection
            selectedFilters={selectedFilters}
            forceUpdate={shouldUpdateData}
            openSections={openSections?.connection}
            onGetIsSectionExpanded={handleSectionToggle}
          />
        </StackItem>

        <StackItem>
          <Latency
            title={Labels.LatencyOut}
            selectedFilters={{ ...selectedFilters, direction: Direction.Incoming }}
            openSections={openSections?.latency}
            forceUpdate={shouldUpdateData}
            onGetIsSectionExpanded={handleSectionToggle}
          />
        </StackItem>

        <StackItem>
          <Latency
            title={Labels.LatencyOut}
            selectedFilters={{ ...selectedFilters, direction: Direction.Outgoing }}
            openSections={openSections?.latency}
            forceUpdate={shouldUpdateData}
            onGetIsSectionExpanded={handleSectionToggle}
          />
        </StackItem>

        {showHttp && (
          <>
            <StackItem>
              <Request
                selectedFilters={selectedFilters}
                openSections={openSections?.request}
                forceUpdate={shouldUpdateData}
                onGetIsSectionExpanded={handleSectionToggle}
              />
            </StackItem>

            <StackItem>
              <Response
                selectedFilters={selectedFilters}
                openSections={openSections?.response}
                forceUpdate={shouldUpdateData}
                onGetIsSectionExpanded={handleSectionToggle}
              />
            </StackItem>
          </>
        )}
      </Stack>
    </>
  );
};

export default Metrics;
