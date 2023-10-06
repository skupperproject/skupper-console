import { FC, useMemo, useState, MouseEvent, ChangeEvent, memo, useCallback } from 'react';

import { Toolbar, ToolbarContent, ToolbarItem, ToolbarGroup, Card } from '@patternfly/react-core';
import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core/deprecated';

import { AvailableProtocols } from '@API/REST.enum';
import { siteNameAndIdSeparator } from '@config/prometheus';

import DateTimeRangeFilter from './DateTimeRangeFilter';
import UpdateMetricsButton from './UpdateMetricsButton';
import { configDefaultFilters, filterToggleDefault } from '../Metrics.constants';
import { MetricsLabels } from '../Metrics.enum';
import { ConfigMetricFilters, MetricFiltersProps, QueryMetricsParams } from '../Metrics.interfaces';

const MetricFilters: FC<MetricFiltersProps> = memo(
  ({
    configFilters,
    defaultMetricFilterValues,
    defaultRefreshDataInterval,
    sourceSites,
    destSites,
    sourceProcesses,
    destProcesses,
    availableProtocols = [AvailableProtocols.Http, AvailableProtocols.Http2, AvailableProtocols.Tcp],
    startTimeLimit = 0, // Use startTimeLimit to set the left temporal limit of the SelectTimeInterval filter
    isRefetching = false,
    onRefetch = () => null,
    onSelectFilters
  }) => {
    const config: ConfigMetricFilters = { ...configDefaultFilters, ...configFilters };
    const [selectedFilterIsOpen, setSelectedFilterIsOpen] = useState(filterToggleDefault);
    const [refreshInterval, setRefreshInterval] = useState(defaultRefreshDataInterval);
    const [selectedFilter, setSelectedFilter] = useState<QueryMetricsParams>(defaultMetricFilterValues);
    // Handler for toggling the open and closed states of a Select element.
    function handleToggleSourceSiteMenu(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, sourceSite: isOpen });
    }

    function handleToggleDestSiteMenu(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, destSite: isOpen });
    }

    function handleToggleSourceProcessMenu(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, sourceProcess: isOpen });
    }

    function handleToggleDestinationProcessMenu(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, destProcess: isOpen });
    }

    function handleToggleProtocol(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, protocol: isOpen });
    }

    function handleSelectSiteSource(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const sourceSite = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, sourceSite, sourceProcess: undefined });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, sourceSite: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, sourceSite }, refreshInterval);
      }
    }

    function handleSelectSource(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const sourceProcess = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, sourceProcess });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, sourceProcess: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, sourceProcess }, refreshInterval);
      }
    }

    function handleSelectSiteDest(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const destSite = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, destSite, destProcess: undefined });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, destSite: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, destSite }, refreshInterval);
      }
    }

    function handleSelectDestination(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const destProcess = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, destProcess });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, destProcess: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, destProcess }, refreshInterval);
      }
    }

    function handleSelectProtocol(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const protocol = selection as AvailableProtocols | undefined;

      setSelectedFilter({ ...selectedFilter, protocol });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, protocol: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, protocol }, refreshInterval);
      }
    }

    function handleSelectTimeInterval({
      start,
      end,
      duration
    }: {
      start: number | undefined;
      end: number | undefined;
      duration: number | undefined;
    }) {
      setSelectedFilter({ ...selectedFilter, start, end, duration });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, start, end, duration }, duration ? refreshInterval : 0);
      }
    }

    const handleSelectRefreshInterval = useCallback(
      (selection: number | undefined) => {
        setRefreshInterval(selection);

        if (onSelectFilters) {
          onSelectFilters(selectedFilter, selection);
        }
      },
      [onSelectFilters, selectedFilter]
    );

    //  source site select options
    const optionsSourceSitesWithDefault = useMemo(
      () =>
        (sourceSites || []).map(({ name }, index) => (
          <SelectOption key={index} value={name}>
            {name.split(siteNameAndIdSeparator)[0]}
          </SelectOption>
        )),
      [sourceSites]
    );

    // dest sites select options
    const optionsDestinationSitesWithDefault = useMemo(
      () =>
        (destSites || []).map(({ name }, index) => (
          <SelectOption key={index} value={name}>
            {name.split(siteNameAndIdSeparator)[0]}
          </SelectOption>
        )),
      [destSites]
    );

    // process sources select options
    const optionsProcessSourcesWithDefault = useMemo(
      () =>
        (sourceProcesses || []).map(({ destinationName }, index) => (
          <SelectOption key={index} value={destinationName} />
        )),
      [sourceProcesses]
    );

    // process connected select options
    const optionsProcessConnectedWithDefault = useMemo(
      () =>
        (destProcesses || []).map(({ destinationName }, index) => <SelectOption key={index} value={destinationName} />),
      [destProcesses]
    );

    // protocol select options
    const optionsProtocolsWithDefault = useMemo(
      () => availableProtocols.map((option, index) => <SelectOption key={index} value={option} />),
      [availableProtocols]
    );

    return (
      <Card>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                {!!optionsSourceSitesWithDefault.length && !config.sourceSites?.hide && (
                  <Select
                    selections={
                      selectedFilter.sourceSite && selectedFilter.sourceSite.split('|').length > 1
                        ? undefined
                        : selectedFilter.sourceSite
                    }
                    placeholderText={config.sourceSites?.placeholder}
                    isOpen={selectedFilterIsOpen.sourceSite}
                    isDisabled={!!config.sourceSites?.disabled}
                    onSelect={handleSelectSiteSource}
                    onClear={!config.sourceSites?.disabled ? handleSelectSiteSource : undefined}
                    onToggle={(_, isOpen) => handleToggleSourceSiteMenu(isOpen)}
                  >
                    {optionsSourceSitesWithDefault}
                  </Select>
                )}

                {!config.sourceProcesses?.hide && (
                  <Select
                    selections={
                      selectedFilter.sourceProcess && selectedFilter.sourceProcess.split('|').length > 1
                        ? undefined
                        : selectedFilter.sourceProcess
                    }
                    placeholderText={config.sourceProcesses?.placeholder}
                    isOpen={selectedFilterIsOpen.sourceProcess}
                    isDisabled={!!config.sourceProcesses?.disabled}
                    onSelect={handleSelectSource}
                    onClear={!config.sourceProcesses?.disabled ? handleSelectSource : undefined}
                    onToggle={(_, isOpen) => handleToggleSourceProcessMenu(isOpen)}
                  >
                    {optionsProcessSourcesWithDefault}
                  </Select>
                )}
              </ToolbarItem>

              <ToolbarItem>
                {!!optionsDestinationSitesWithDefault.length && !config.destSites?.hide && (
                  <Select
                    selections={
                      selectedFilter.destSite && selectedFilter.destSite.split('|').length > 1
                        ? undefined
                        : selectedFilter.destSite
                    }
                    placeholderText={config.destSites?.placeholder}
                    isOpen={selectedFilterIsOpen.destSite}
                    isDisabled={!!config.destSites?.disabled}
                    onSelect={handleSelectSiteDest}
                    onClear={!config.destSites?.disabled ? handleSelectSiteDest : undefined}
                    onToggle={(_, isOpen) => handleToggleDestSiteMenu(isOpen)}
                  >
                    {optionsDestinationSitesWithDefault}
                  </Select>
                )}

                {!config.destinationProcesses?.hide && (
                  <Select
                    selections={
                      selectedFilter.destProcess && selectedFilter.destProcess.split('|').length > 1
                        ? undefined
                        : selectedFilter.destProcess
                    }
                    placeholderText={config.destinationProcesses?.placeholder}
                    isDisabled={!!config.destinationProcesses?.disabled}
                    isOpen={selectedFilterIsOpen.destProcess}
                    onSelect={handleSelectDestination}
                    onClear={!config.destinationProcesses?.disabled ? handleSelectDestination : undefined}
                    onToggle={(_, isOpen) => handleToggleDestinationProcessMenu(isOpen)}
                  >
                    {optionsProcessConnectedWithDefault}
                  </Select>
                )}
              </ToolbarItem>

              <ToolbarItem>
                <Select
                  selections={selectedFilter.protocol}
                  placeholderText={MetricsLabels.FilterProtocolsDefault}
                  isOpen={selectedFilterIsOpen.protocol}
                  isDisabled={!!config.protocols?.disabled}
                  onSelect={handleSelectProtocol}
                  onClear={
                    optionsProtocolsWithDefault.length > 1 && !config.protocols?.disabled
                      ? handleSelectProtocol
                      : undefined
                  }
                  onToggle={(_, isOpen) => handleToggleProtocol(isOpen)}
                >
                  {optionsProtocolsWithDefault}
                </Select>
              </ToolbarItem>
            </ToolbarGroup>

            {/* Display filters */}
            <ToolbarGroup align={{ default: 'alignRight' }}>
              <ToolbarItem>
                <DateTimeRangeFilter
                  startSelected={selectedFilter.start}
                  endSelected={selectedFilter.end}
                  duration={selectedFilter.duration}
                  startTimeLimit={startTimeLimit}
                  onSelectTimeInterval={handleSelectTimeInterval}
                />
              </ToolbarItem>
            </ToolbarGroup>

            <ToolbarGroup>
              <ToolbarItem>
                <UpdateMetricsButton
                  isLoading={isRefetching}
                  isDisabled={!selectedFilter.duration}
                  refreshIntervalDefault={refreshInterval}
                  onRefreshIntervalSelected={handleSelectRefreshInterval}
                  onClick={onRefetch}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </Card>
    );
  }
);

export default MetricFilters;
