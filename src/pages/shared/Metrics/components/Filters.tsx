import { FC, useMemo, useState, MouseEvent, ChangeEvent, memo, useCallback } from 'react';

import { Toolbar, ToolbarContent, ToolbarItem, ToolbarGroup, Card } from '@patternfly/react-core';
import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core/deprecated';
import { OutlinedClockIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';

import { IntervalTimeProp } from '@API/Prometheus.interfaces';
import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { CollectorsResponse } from '@API/REST.interfaces';
import { siteNameAndIdSeparator, timeIntervalMap } from '@config/prometheus';
import { getCurrentAndPastTimestamps } from '@core/utils/getCurrentAndPastTimestamps';

import UpdateMetricsButton from './UpdateMetricsButton';
import { configDefaultFilters, filterToggleDefault } from '../Metrics.constants';
import { MetricsLabels } from '../Metrics.enum';
import { MetricFiltersProps, SelectedMetricFilters } from '../Metrics.interfaces';

const MetricFilters: FC<MetricFiltersProps> = memo(
  ({
    configFilters,
    defaultMetricFilterValues,
    sourceSites,
    destSites,
    sourceProcesses,
    destProcesses,
    availableProtocols = [AvailableProtocols.Http, AvailableProtocols.Http2, AvailableProtocols.Tcp],
    refreshDataInterval,
    startTime = 0, // indicates the beginning point for computing the duration of the time interval.
    isRefetching = false,
    onRefetch = () => null,
    onSelectFilters
  }) => {
    const config = { ...configDefaultFilters, ...configFilters };
    const { data: collector } = useQuery(['app-getPrometheusURL'], () => RESTApi.fetchCollectors()) as {
      data: CollectorsResponse;
    };
    // filter the display interval items that are less than startTime
    // ie: if the flow collector restart we don't want start from the beginning
    const timeIntervalMapWindow = useMemo(
      () =>
        Object.values(timeIntervalMap).filter(
          ({ seconds }) =>
            new Date().getTime() - seconds * 1000 > Math.max((collector?.startTime || 0) / 1000, startTime / 1000)
        ),
      [collector?.startTime, startTime]
    );

    const [selectedFilterIsOpen, setSelectedFilterIsOpen] = useState(filterToggleDefault);
    const [selectedFilter, setSelectedFilter] = useState<SelectedMetricFilters>({
      ...defaultMetricFilterValues,
      refreshDataInterval
    });

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

    function handleToggleTimeIntervalMenu(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, timeInterval: isOpen });
    }

    function handleSelectSiteSource(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const sourceSite = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, sourceSite, sourceProcess: undefined });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, sourceSite: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, sourceSite });
      }
    }

    function handleSelectSource(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const sourceProcess = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, sourceProcess });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, sourceProcess: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, sourceProcess });
      }
    }

    function handleSelectSiteDest(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const destSite = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, destSite, destProcess: undefined });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, destSite: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, destSite });
      }
    }

    function handleSelectDestination(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const destProcess = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, destProcess });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, destProcess: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, destProcess });
      }
    }

    function handleSelectProtocol(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const protocol = selection as AvailableProtocols | undefined;

      setSelectedFilter({ ...selectedFilter, protocol });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, protocol: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, protocol });
      }
    }

    function handleSelectTimeInterval(_: MouseEvent | ChangeEvent, selection: SelectOptionObject) {
      const timeIntervalKey = selection as IntervalTimeProp['key'];
      const { start, end } = getCurrentAndPastTimestamps(timeIntervalMap[timeIntervalKey].seconds);

      setSelectedFilter({ ...selectedFilter, timeInterval: timeIntervalMap[timeIntervalKey] });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, timeInterval: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, timeInterval: timeIntervalMap[timeIntervalKey], start, end });
      }
    }

    const handleSelectDisplayInterval = useCallback(
      (selection: string | undefined) => {
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

    // time interval select options
    const optionsTimeIntervalWithDefault = useMemo(
      () =>
        timeIntervalMapWindow.map(({ key, label }, index) => (
          <SelectOption key={index} value={key}>
            {label}
          </SelectOption>
        )),
      [timeIntervalMapWindow]
    );

    return (
      <Card>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                {!!optionsSourceSitesWithDefault.length && !config.sourceSites.hide && (
                  <Select
                    selections={
                      selectedFilter.sourceSite && selectedFilter.sourceSite.split('|').length > 1
                        ? undefined
                        : selectedFilter.sourceSite
                    }
                    placeholderText={config.sourceSites.placeholder}
                    isOpen={selectedFilterIsOpen.sourceSite}
                    isDisabled={config.sourceSites.disabled}
                    onSelect={handleSelectSiteSource}
                    onClear={!config.sourceSites.disabled ? handleSelectSiteSource : undefined}
                    onToggle={(_, isOpen) => handleToggleSourceSiteMenu(isOpen)}
                  >
                    {optionsSourceSitesWithDefault}
                  </Select>
                )}

                {!config.sourceProcesses.hide && (
                  <Select
                    selections={
                      selectedFilter.sourceProcess && selectedFilter.sourceProcess.split('|').length > 1
                        ? undefined
                        : selectedFilter.sourceProcess
                    }
                    placeholderText={config.sourceProcesses.placeholder}
                    isOpen={selectedFilterIsOpen.sourceProcess}
                    isDisabled={config.sourceProcesses.disabled}
                    onSelect={handleSelectSource}
                    onClear={!config.sourceProcesses.disabled ? handleSelectSource : undefined}
                    onToggle={(_, isOpen) => handleToggleSourceProcessMenu(isOpen)}
                  >
                    {optionsProcessSourcesWithDefault}
                  </Select>
                )}
              </ToolbarItem>

              <ToolbarItem>
                {!!optionsDestinationSitesWithDefault.length && !config.destSites.hide && (
                  <Select
                    selections={
                      selectedFilter.destSite && selectedFilter.destSite.split('|').length > 1
                        ? undefined
                        : selectedFilter.destSite
                    }
                    placeholderText={config.destSites.placeholder}
                    isOpen={selectedFilterIsOpen.destSite}
                    isDisabled={config.destSites.disabled}
                    onSelect={handleSelectSiteDest}
                    onClear={!config.destSites.disabled ? handleSelectSiteDest : undefined}
                    onToggle={(_, isOpen) => handleToggleDestSiteMenu(isOpen)}
                  >
                    {optionsDestinationSitesWithDefault}
                  </Select>
                )}

                {!config.destinationProcesses.hide && (
                  <Select
                    selections={
                      selectedFilter.destProcess && selectedFilter.destProcess.split('|').length > 1
                        ? undefined
                        : selectedFilter.destProcess
                    }
                    placeholderText={config.destinationProcesses.placeholder}
                    isDisabled={config.destinationProcesses.disabled}
                    isOpen={selectedFilterIsOpen.destProcess}
                    onSelect={handleSelectDestination}
                    onClear={!config.destinationProcesses.disabled ? handleSelectDestination : undefined}
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
                  isDisabled={config.protocols.disabled}
                  onSelect={handleSelectProtocol}
                  onClear={
                    optionsProtocolsWithDefault.length > 1 && !config.protocols.disabled
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
                <Select
                  selections={selectedFilter.timeInterval?.label}
                  isOpen={selectedFilterIsOpen.timeInterval}
                  isDisabled={config.timeIntervals.disabled}
                  onSelect={handleSelectTimeInterval}
                  toggleIcon={<OutlinedClockIcon />}
                  onToggle={(_, isOpen) => handleToggleTimeIntervalMenu(isOpen)}
                >
                  {optionsTimeIntervalWithDefault}
                </Select>
              </ToolbarItem>
            </ToolbarGroup>

            <ToolbarGroup variant={'filter-group'}>
              <ToolbarItem>
                <UpdateMetricsButton
                  isLoading={isRefetching}
                  onRefreshIntervalSelected={handleSelectDisplayInterval}
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
