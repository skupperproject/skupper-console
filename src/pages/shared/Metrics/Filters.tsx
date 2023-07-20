import { FC, useCallback, useMemo, useState, MouseEvent, ChangeEvent, memo } from 'react';

import {
  Button,
  Select,
  SelectOption,
  SelectOptionObject,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  Tooltip
} from '@patternfly/react-core';
import { ClusterIcon, OutlinedClockIcon, SyncIcon } from '@patternfly/react-icons';

import { IntervalTimeProp } from '@API/Prometheus.interfaces';
import { AvailableProtocols } from '@API/REST.enum';
import { geCollectorStartTime } from '@config/config';
import { timeIntervalMap } from '@config/prometheus';

import { displayIntervalMap, filterOptionsDefault, filterToggleDefault } from './Metrics.constant';
import { MetricsLabels } from './Metrics.enum';
import { MetricFilterProps, FilterProps } from './Metrics.interfaces';

const MetricFilters: FC<MetricFilterProps> = memo(
  ({
    sourceProcesses,
    processesConnected,
    availableProtocols = [AvailableProtocols.Http, AvailableProtocols.Http2, AvailableProtocols.Tcp],
    customFilterOptions,
    initialFilters,
    startTime = 0, // indicates the beginning point for computing the duration of the time interval.
    isRefetching = false,
    forceDisableRefetchData = false,
    onRefetch,
    onSelectFilters
  }) => {
    const filterOptions = { ...filterOptionsDefault, ...customFilterOptions };

    // filter the display interval items that are less than startTime
    // ie: if the flow collector restart we don't want start from the beginning
    const timeIntervalMapWindow = useMemo(
      () =>
        Object.values(timeIntervalMap).filter(
          ({ seconds }) => new Date().getTime() - seconds * 1000 > Math.max(geCollectorStartTime(), startTime / 1000)
        ),
      [startTime]
    );

    const [selectedFilterIsOpen, setSelectedFilterIsOpen] = useState(filterToggleDefault);
    const [selectedFilter, setSelectedFilter] = useState<FilterProps>(initialFilters);

    const handleRefetchMetrics = useCallback(() => {
      if (onRefetch) {
        onRefetch();
      }
    }, [onRefetch]);

    // Handler for toggling the open and closed states of a Select element.
    function handleToggleSourceProcessMenu(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, processIdSource: isOpen });
    }

    function handleToggleDestinationProcessMenu(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, processIdDest: isOpen });
    }

    function handleToggleProtocol(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, protocol: isOpen });
    }

    function handleToggleTimeIntervalMenu(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, timeInterval: isOpen });
    }

    function handleToggleDisplayInterval(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, displayInterval: isOpen });
    }

    // Handler for selecting filters in a Select element
    function handleSelectSource(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const processIdSource = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, processIdSource });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, processIdSource: false });

      if (onSelectFilters) {
        // sourceID is mandatory. if the element selected is a placeholder use  the default value passed to the filter
        onSelectFilters({ ...selectedFilter, processIdSource: processIdSource || initialFilters.processIdSource });
      }
    }

    function handleSelectDestination(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const processIdDest = selection as string | undefined;

      setSelectedFilter({ ...selectedFilter, processIdDest });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, processIdDest: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, processIdDest });
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

    function handleSelectTimeIntervalMenu(_: MouseEvent | ChangeEvent, selection: SelectOptionObject) {
      const timeIntervalKey = selection as IntervalTimeProp['key'];

      setSelectedFilter({ ...selectedFilter, timeInterval: timeIntervalMap[timeIntervalKey] });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, timeInterval: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, timeInterval: timeIntervalMap[timeIntervalKey] });
      }
    }

    function handleSelectDisplayInterval(_: MouseEvent | ChangeEvent, selection: SelectOptionObject) {
      const keySelected = selection as string;
      const displayInterval = displayIntervalMap.find(({ key }) => key === keySelected)?.key;

      setSelectedFilter({ ...selectedFilter, displayInterval });
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, displayInterval: false });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilter, displayInterval });
      }
    }

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
        (processesConnected || []).map(({ destinationName }, index) => (
          <SelectOption key={index} value={destinationName} />
        )),
      [processesConnected]
    );

    // protocol select options
    const optionsProtocolsWithDefault = useMemo(
      () => availableProtocols.map((option, index) => <SelectOption key={index} value={option} />),
      [availableProtocols]
    );

    // time interval select options
    const optionsTimeIntervalWithDefault = useMemo(
      () =>
        timeIntervalMapWindow.map((interval, index) => (
          <SelectOption key={index} value={interval.key}>
            {interval.label}
          </SelectOption>
        )),
      [timeIntervalMapWindow]
    );

    // displayInterval select options
    const optionsDisplayIntervalWithDefault = useMemo(
      () =>
        displayIntervalMap.map(({ label, key }, index) => (
          <SelectOption key={index} value={key}>
            {label}
          </SelectOption>
        )),
      []
    );

    return (
      <Toolbar>
        <ToolbarContent>
          {/* entity filters */}
          <ToolbarGroup>
            <ToolbarItem variant="label">{MetricsLabels.MetricFilters}</ToolbarItem>

            <ToolbarItem>
              <Select
                selections={selectedFilter.processIdSource}
                placeholderText={filterOptions.sourceProcesses.placeholder}
                isOpen={selectedFilterIsOpen.processIdSource}
                isDisabled={filterOptions.sourceProcesses.disabled}
                onSelect={handleSelectSource}
                onClear={
                  optionsProcessSourcesWithDefault.length > 1 && !filterOptions.sourceProcesses.disabled
                    ? handleSelectSource
                    : undefined
                }
                onToggle={handleToggleSourceProcessMenu}
                toggleIcon={<ClusterIcon />}
              >
                {optionsProcessSourcesWithDefault}
              </Select>
            </ToolbarItem>

            <ToolbarItem>
              {!filterOptions.destinationProcesses.hide && (
                <Select
                  selections={selectedFilter.processIdDest}
                  placeholderText={filterOptions.destinationProcesses.placeholder}
                  isDisabled={filterOptions.destinationProcesses.disabled}
                  isOpen={selectedFilterIsOpen.processIdDest}
                  onSelect={handleSelectDestination}
                  onClear={
                    optionsProcessConnectedWithDefault.length > 1 && !filterOptions.destinationProcesses.disabled
                      ? handleSelectDestination
                      : undefined
                  }
                  onToggle={handleToggleDestinationProcessMenu}
                  toggleIcon={<ClusterIcon />}
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
                isDisabled={filterOptions.protocols.disabled}
                onToggle={handleToggleProtocol}
                onSelect={handleSelectProtocol}
                onClear={
                  optionsProtocolsWithDefault.length > 1 && !filterOptions.protocols.disabled
                    ? handleSelectProtocol
                    : undefined
                }
              >
                {optionsProtocolsWithDefault}
              </Select>
            </ToolbarItem>
          </ToolbarGroup>

          {/* Display filters */}
          <ToolbarGroup variant={'filter-group'} alignment={{ default: 'alignRight' }}>
            <ToolbarItem>
              <Select
                selections={selectedFilter.timeInterval?.label}
                isOpen={selectedFilterIsOpen.timeInterval}
                isDisabled={filterOptions.timeIntervals.disabled}
                onSelect={handleSelectTimeIntervalMenu}
                onToggle={handleToggleTimeIntervalMenu}
                toggleIcon={<OutlinedClockIcon />}
              >
                {optionsTimeIntervalWithDefault}
              </Select>
            </ToolbarItem>

            <ToolbarItem>
              <Select
                selections={selectedFilter.displayInterval}
                isOpen={selectedFilterIsOpen.displayInterval}
                onSelect={handleSelectDisplayInterval}
                onToggle={handleToggleDisplayInterval}
              >
                {optionsDisplayIntervalWithDefault}
              </Select>
            </ToolbarItem>

            <ToolbarItem>
              <Tooltip content={MetricsLabels.RefetchData}>
                <Button
                  variant="primary"
                  isLoading={isRefetching}
                  isDisabled={
                    forceDisableRefetchData ||
                    (!!selectedFilter.displayInterval && selectedFilter.displayInterval !== displayIntervalMap[0].key)
                  }
                  onClick={handleRefetchMetrics}
                  icon={<SyncIcon />}
                />
              </Tooltip>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    );
  }
);

export default MetricFilters;
