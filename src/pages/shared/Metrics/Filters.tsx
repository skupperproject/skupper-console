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
import { ClockIcon, ClusterIcon, SyncIcon } from '@patternfly/react-icons';

import { IntervalTimeProp } from '@API/Prometheus.interfaces';
import { gePrometheusStartTime, timeIntervalMap } from '@API/Prometheus.queries';
import { AvailableProtocols } from '@API/REST.enum';

import { MetricsLabels } from './Metrics.enum';
import { FilterMetricProps } from './Metrics.interfaces';
import { QueryMetricsParams } from './services/services.interfaces';

const displayIntervalMap = [
  {
    value: 0,
    label: 'Pause'
  },
  {
    value: 20 * 1000,
    label: 'every 20s'
  },
  {
    value: 40 * 1000,
    label: 'every 40s'
  },
  {
    value: 60 * 1000,
    label: 'every 1m'
  },
  {
    value: 120 * 1000,
    label: 'every 2m'
  }
];

// default values to enable/disable filters
const filterOptionsDefault = {
  sourceProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllSourceProcesses },
  destinationProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationProcesses },
  protocols: { disabled: false, placeholder: MetricsLabels.FilterProtocolsDefault },
  timeIntervals: { disabled: false }
};

const filterToggleDefault = {
  processIdSource: false,
  processIdDest: false,
  protocol: false,
  timeInterval: false,
  displayInterval: false
};

const MetricFilters: FC<FilterMetricProps> = memo(
  ({
    sourceProcesses,
    processesConnected,
    customFilterOptions,
    filters: customFilters,
    startTime = 0, // indicates the beginning point for computing the duration of the time interval.
    isRefetching = false,
    onRefetch,
    onRefetchInterval,
    onSelectFilters
  }) => {
    const filterOptions = { ...filterOptionsDefault, ...customFilterOptions };
    const timeIntervalMapWindow = useMemo(
      () =>
        Object.values(timeIntervalMap).filter(
          ({ seconds }) => new Date().getTime() - seconds * 1000 > Math.max(gePrometheusStartTime(), startTime / 1000)
        ),
      [startTime]
    );

    const [displayInterval, setDisplayInterval] = useState(displayIntervalMap[0].label);
    const [filterSelectedIsOpen, setFilterSelectedIsOpen] = useState(filterToggleDefault);
    const [filters, setFilterSelected] = useState<QueryMetricsParams>({
      processIdSource: customFilters.processIdSource, // our queries to prometheus must have a source id or list of ids ("id1|id2|id3...")
      processIdDest: customFilters.processIdDest,
      protocol: customFilters.protocol,
      timeInterval: customFilters.timeInterval
    });

    const handleRefetchMetrics = useCallback(() => {
      if (onRefetch) {
        onRefetch();
      }
    }, [onRefetch]);

    // Handler for toggling the open and closed states of a Select element.
    function handleToggleSourceProcessMenu(isOpen: boolean) {
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, processIdSource: isOpen });
    }

    function handleToggleDestinationProcessMenu(isOpen: boolean) {
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, processIdDest: isOpen });
    }

    function handleToggleProtocol(isOpen: boolean) {
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, protocol: isOpen });
    }

    function handleToggleTimeIntervalMenu(isOpen: boolean) {
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, timeInterval: isOpen });
    }

    function handleToggleDisplayInterval(isOpen: boolean) {
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, displayInterval: isOpen });
    }

    // Handler for selecting filters in a Select element
    function handleSelectSource(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      // sourceID is mandatory. if the element selected is a placeholder use  the default value passed to the filter
      const processIdSource = (selection || customFilters.processIdSource) as string;

      setFilterSelected({ ...filters, processIdSource });
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, processIdSource: false });

      if (onSelectFilters) {
        onSelectFilters({ ...filters, processIdSource });
      }
    }

    function handleSelectDestination(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const processIdDest = selection as string | undefined;

      setFilterSelected({ ...filters, processIdDest });
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, processIdDest: false });

      if (onSelectFilters) {
        onSelectFilters({ ...filters, processIdDest });
      }
    }

    function handleSelectProtocol(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const protocol = selection as AvailableProtocols | undefined;

      setFilterSelected({ ...filters, protocol });
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, protocol: false });

      if (onSelectFilters) {
        onSelectFilters({ ...filters, protocol });
      }
    }

    function handleSelectTimeIntervalMenu(_: MouseEvent | ChangeEvent, selection: SelectOptionObject) {
      const timeIntervalKey = selection as IntervalTimeProp['key'];

      setFilterSelected({ ...filters, timeInterval: timeIntervalMap[timeIntervalKey] });
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, timeInterval: false });

      if (onSelectFilters) {
        onSelectFilters({ ...filters, timeInterval: timeIntervalMap[timeIntervalKey] });
      }
    }

    function handleSelectDisplayInterval(_: MouseEvent | ChangeEvent, selection: SelectOptionObject) {
      const intervalLabel = selection as string;
      const interval = displayIntervalMap.find(({ label }) => label === intervalLabel)?.value || 0;

      setDisplayInterval(intervalLabel);
      setFilterSelectedIsOpen({ ...filterSelectedIsOpen, displayInterval: false });

      if (onRefetchInterval) {
        onRefetchInterval(interval);
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
      () =>
        [AvailableProtocols.Http, AvailableProtocols.Http2, AvailableProtocols.Tcp].map((option, index) => (
          <SelectOption key={index} value={option} />
        )),
      []
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
      () => displayIntervalMap.map(({ label }, index) => <SelectOption key={index} value={label} />),
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
                selections={filters.processIdSource}
                placeholderText={filterOptions.sourceProcesses.placeholder}
                isOpen={filterSelectedIsOpen.processIdSource}
                isDisabled={filterOptions.sourceProcesses.disabled}
                onSelect={handleSelectSource}
                onClear={
                  optionsProcessSourcesWithDefault.length > 1 && !filterOptions.sourceProcesses.disabled
                    ? handleSelectSource
                    : undefined
                }
                onToggle={handleToggleSourceProcessMenu}
                toggleIcon={<ClusterIcon color="var(--pf-global--palette--black-600)" />}
              >
                {optionsProcessSourcesWithDefault}
              </Select>
            </ToolbarItem>

            <ToolbarItem>
              {!filterOptions.destinationProcesses.disabled && (
                <Select
                  selections={filters.processIdDest}
                  placeholderText={filterOptions.destinationProcesses.placeholder}
                  isDisabled={filterOptions.destinationProcesses.disabled}
                  isOpen={filterSelectedIsOpen.processIdDest}
                  onSelect={handleSelectDestination}
                  onClear={
                    optionsProcessConnectedWithDefault.length > 1 && !filterOptions.destinationProcesses.disabled
                      ? handleSelectDestination
                      : undefined
                  }
                  onToggle={handleToggleDestinationProcessMenu}
                  toggleIcon={<ClusterIcon color="var(--pf-global--palette--black-600)" />}
                >
                  {optionsProcessConnectedWithDefault}
                </Select>
              )}
            </ToolbarItem>

            <ToolbarItem>
              <Select
                selections={filters.protocol}
                placeholderText={MetricsLabels.FilterProtocolsDefault}
                isOpen={filterSelectedIsOpen.protocol}
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
            <ToolbarItem variant="label">{MetricsLabels.MetricDisplayFilters}</ToolbarItem>

            <ToolbarItem>
              <Select
                selections={filters.timeInterval.label}
                isOpen={filterSelectedIsOpen.timeInterval}
                isDisabled={filterOptions.timeIntervals.disabled}
                onSelect={handleSelectTimeIntervalMenu}
                onToggle={handleToggleTimeIntervalMenu}
                toggleIcon={<ClockIcon color="var(--pf-global--palette--black-600)" />}
              >
                {optionsTimeIntervalWithDefault}
              </Select>
            </ToolbarItem>

            <ToolbarItem>
              <Select
                selections={displayInterval}
                isOpen={filterSelectedIsOpen.displayInterval}
                onSelect={handleSelectDisplayInterval}
                onToggle={handleToggleDisplayInterval}
              >
                {optionsDisplayIntervalWithDefault}
              </Select>
            </ToolbarItem>

            <ToolbarItem>
              <Tooltip content={MetricsLabels.RefetchData}>
                <Button
                  variant="plain"
                  isLoading={isRefetching}
                  isDisabled={displayInterval !== displayIntervalMap[0].label}
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
