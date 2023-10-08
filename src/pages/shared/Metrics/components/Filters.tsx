import {
  FC,
  useMemo,
  useState,
  useRef,
  MouseEvent,
  ChangeEvent,
  memo,
  useCallback,
  MouseEvent as ReactMouseEvent,
  RefObject
} from 'react';

import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  Card,
  Popper,
  MenuToggle,
  Menu,
  MenuContent,
  MenuList,
  MenuItem
} from '@patternfly/react-core';
import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core/deprecated';

import { AvailableProtocols } from '@API/REST.enum';
import { siteNameAndIdSeparator } from '@config/prometheus';
import ResourceIcon from '@core/components/ResourceIcon';
import { deepMergeJSONObjects } from '@core/utils/deepMergeWithJSONObjects';

import DateTimeRangeFilter from './DateTimeRangeFilter';
import UpdateMetricsButton from './UpdateMetricsButton';
import { configDefaultFilters, filterToggleDefault } from '../Metrics.constants';
import { MetricsLabels } from '../Metrics.enum';
import { ConfigMetricFilters, MetricFiltersProps, QueryMetricsParams } from '../Metrics.interfaces';

const MetricFilters: FC<MetricFiltersProps> = memo(
  ({
    configFilters = {},
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
    const config: ConfigMetricFilters = deepMergeJSONObjects<ConfigMetricFilters>(configDefaultFilters, configFilters);

    const sourceSitesContainerRef = useRef<HTMLDivElement>(null);
    const sourceSitesToggleRef = useRef<HTMLButtonElement>(null);
    const sourceSitesMenuRef = useRef<HTMLDivElement>(null);

    const destSitesContainerRef = useRef<HTMLDivElement>(null);
    const destSitesToggleRef = useRef<HTMLButtonElement>(null);
    const destSitesMenuRef = useRef<HTMLDivElement>(null);

    const sourceProcessesContainerRef = useRef<HTMLDivElement>(null);
    const sourceProcessesToggleRef = useRef<HTMLButtonElement>(null);
    const sourceProcessesMenuRef = useRef<HTMLDivElement>(null);

    const destProcessesContainerRef = useRef<HTMLDivElement>(null);
    const destProcessesToggleRef = useRef<HTMLButtonElement>(null);
    const destProcessesMenuRef = useRef<HTMLDivElement>(null);

    const [selectedFilters, setSelectedFilters] = useState<QueryMetricsParams>(defaultMetricFilterValues);
    const [selectedFilterIsOpen, setSelectedFilterIsOpen] = useState<Record<string, boolean>>(filterToggleDefault);
    const [refreshInterval, setRefreshInterval] = useState(defaultRefreshDataInterval);

    // Handler for toggling the open and closed states of a Select element.
    function handleToggleMenu(ev: ReactMouseEvent, openFilter: Record<string, boolean>) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, ...openFilter });
    }

    function handleToggleProtocol(isOpen: boolean) {
      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, protocol: isOpen });
    }

    function handleSelect(selections: Record<string, string | undefined>) {
      const filters = { ...selectedFilters, ...selections };

      setSelectedFilterIsOpen(Object.fromEntries(Object.keys(selectedFilterIsOpen).map((key) => [key, false])));
      setSelectedFilters(filters);

      if (onSelectFilters) {
        onSelectFilters(filters, refreshInterval);
      }
    }

    function handleSelectProtocol(_: MouseEvent | ChangeEvent, selection?: SelectOptionObject) {
      const protocol = selection as AvailableProtocols | undefined;
      const filter = { ...selectedFilters, protocol };

      setSelectedFilterIsOpen({ ...selectedFilterIsOpen, protocol: false });
      setSelectedFilters(filter);

      if (onSelectFilters) {
        onSelectFilters(filter, refreshInterval);
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
      setSelectedFilters({ ...selectedFilters, start, end, duration });

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilters, start, end, duration }, duration ? refreshInterval : 0);
      }
    }

    const handleSelectRefreshInterval = useCallback(
      (selection: number | undefined) => {
        setRefreshInterval(selection);

        if (onSelectFilters) {
          onSelectFilters(selectedFilters, selection);
        }
      },
      [onSelectFilters, selectedFilters]
    );

    // protocol select options
    const optionsProtocolsWithDefault = useMemo(
      () => availableProtocols.map((option, index) => <SelectOption key={index} value={option} />),
      [availableProtocols]
    );

    function getMenu(
      list: { destinationName: string }[] | undefined,
      selected: string | undefined,
      menuRef: RefObject<HTMLDivElement>,
      defaultlabel: string,
      onSelect: (event?: ReactMouseEvent, itemId?: string | number) => void
    ) {
      return (
        <Menu ref={menuRef} onSelect={onSelect} selected={selected}>
          <MenuContent>
            <MenuList>
              <MenuItem key={`site-${defaultlabel}`} itemId={undefined}>
                {defaultlabel}
              </MenuItem>
              {(list || []).map(({ destinationName }) => (
                <MenuItem key={`site-${destinationName}`} itemId={destinationName}>
                  {destinationName.split(siteNameAndIdSeparator)[0]}
                </MenuItem>
              ))}
            </MenuList>
          </MenuContent>
        </Menu>
      );
    }

    const getToggle = (
      selected: string | undefined,
      toggleRef: RefObject<HTMLButtonElement>,
      isOpen: boolean,
      isDisabled: boolean,
      iconType: 'site' | 'process',
      onClick: (ev: ReactMouseEvent) => void
    ) => (
      <MenuToggle
        isDisabled={isDisabled}
        ref={toggleRef}
        onClick={onClick}
        isExpanded={isOpen}
        icon={<ResourceIcon type={iconType} />}
      >
        {selected}
      </MenuToggle>
    );

    const sourceSiteSelect = (
      <div ref={sourceSitesContainerRef}>
        <Popper
          trigger={getToggle(
            selectedFilters.sourceSite?.split(siteNameAndIdSeparator)[0] || config.sourceSites?.placeholder,
            sourceSitesToggleRef,
            selectedFilterIsOpen.sourceSite,
            !!config.sourceSites?.disabled,
            'site',
            (ev: ReactMouseEvent) => handleToggleMenu(ev, { sourceSite: !selectedFilterIsOpen.sourceSite })
          )}
          triggerRef={sourceSitesToggleRef}
          popper={getMenu(
            sourceSites,
            selectedFilters.sourceSite,
            sourceSitesMenuRef,
            MetricsLabels.FilterAllSourceSites,
            (_: ReactMouseEvent | undefined, sourceSite: string | number | undefined) =>
              handleSelect({ sourceSite: sourceSite as string, sourceProcess: undefined })
          )}
          popperRef={sourceSitesMenuRef}
          appendTo={sourceSitesContainerRef.current || undefined}
          isVisible={selectedFilterIsOpen.sourceSite}
        />
      </div>
    );

    const destSiteSelect = (
      <div ref={destSitesContainerRef}>
        <Popper
          trigger={getToggle(
            selectedFilters.destSite?.split(siteNameAndIdSeparator)[0] || config.destSites?.placeholder,
            destSitesToggleRef,
            selectedFilterIsOpen.destSite,
            !!config.destSites?.disabled,
            'site',
            (ev: ReactMouseEvent) => handleToggleMenu(ev, { destSite: !selectedFilterIsOpen.destSite })
          )}
          triggerRef={destSitesToggleRef}
          popper={getMenu(
            destSites,
            selectedFilters.destSite,
            destSitesMenuRef,
            MetricsLabels.FilterAllDestinationSites,
            (_: ReactMouseEvent | undefined, destSite: string | number | undefined) =>
              handleSelect({ destSite: destSite as string, destProcess: undefined })
          )}
          popperRef={destSitesMenuRef}
          appendTo={destSitesContainerRef.current || undefined}
          isVisible={selectedFilterIsOpen.destSite}
        />
      </div>
    );

    const sourceProcessSelect = (
      <div ref={sourceProcessesContainerRef}>
        <Popper
          trigger={getToggle(
            selectedFilters.sourceProcess?.split(siteNameAndIdSeparator)[0] || config.sourceProcesses?.placeholder,
            sourceProcessesToggleRef,
            selectedFilterIsOpen.sourceProcess,
            !!config.sourceProcesses?.disabled,
            'process',
            (ev: ReactMouseEvent) => handleToggleMenu(ev, { sourceProcess: !selectedFilterIsOpen.sourceProcess })
          )}
          triggerRef={sourceProcessesToggleRef}
          popper={getMenu(
            sourceProcesses?.filter(({ siteName }) =>
              selectedFilters.sourceSite ? siteName === selectedFilters.sourceSite : true
            ),
            selectedFilters.sourceProcess,
            sourceProcessesMenuRef,
            MetricsLabels.FilterAllSourceProcesses,
            (_: ReactMouseEvent | undefined, sourceProcess: string | number | undefined) =>
              handleSelect({ sourceProcess: sourceProcess as string })
          )}
          popperRef={sourceProcessesMenuRef}
          appendTo={sourceProcessesContainerRef.current || undefined}
          isVisible={selectedFilterIsOpen.sourceProcess}
        />
      </div>
    );

    const destProcessSelect = (
      <div ref={destProcessesContainerRef}>
        <Popper
          trigger={getToggle(
            selectedFilters.destProcess?.split(siteNameAndIdSeparator)[0] || config.destinationProcesses?.placeholder,
            destProcessesToggleRef,
            selectedFilterIsOpen.destProcess,
            !!config.destinationProcesses?.disabled,
            'process',
            (ev: ReactMouseEvent) => handleToggleMenu(ev, { destProcess: !selectedFilterIsOpen.destProcess })
          )}
          triggerRef={destProcessesToggleRef}
          popper={getMenu(
            destProcesses?.filter(({ siteName }) =>
              selectedFilters.destSite ? siteName === selectedFilters.destSite : true
            ),
            selectedFilters.destProcess,
            destProcessesMenuRef,
            MetricsLabels.FilterAllDestinationProcesses,
            (_: ReactMouseEvent | undefined, destProcess: string | number | undefined) =>
              handleSelect({ destProcess: destProcess as string })
          )}
          popperRef={destProcessesMenuRef}
          appendTo={destProcessesContainerRef.current || undefined}
          isVisible={selectedFilterIsOpen.destProcess}
        />
      </div>
    );

    return (
      <Card>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup variant="button-group">
              <ToolbarItem>{!config.sourceSites?.hide && sourceSiteSelect}</ToolbarItem>
              <ToolbarItem>{!config.sourceProcesses?.hide && sourceProcessSelect}</ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup variant="button-group">
              <ToolbarItem>{!config.destSites?.hide && destSiteSelect}</ToolbarItem>
              <ToolbarItem>{!config.destinationProcesses?.hide && destProcessSelect}</ToolbarItem>
            </ToolbarGroup>

            <ToolbarItem>
              <Select
                selections={selectedFilters.protocol}
                placeholderText={MetricsLabels.FilterProtocolsDefault}
                isOpen={selectedFilterIsOpen.protocol}
                isDisabled={!!config.protocols?.disabled}
                onSelect={handleSelectProtocol}
                onToggle={(_, isOpen) => handleToggleProtocol(isOpen)}
              >
                {[
                  <SelectOption key={MetricsLabels.FilterProtocolsDefault} value={undefined}>
                    {MetricsLabels.FilterProtocolsDefault}
                  </SelectOption>,
                  ...optionsProtocolsWithDefault
                ]}
              </Select>
            </ToolbarItem>

            <ToolbarGroup align={{ default: 'alignRight' }} variant="button-group">
              <ToolbarItem>
                <DateTimeRangeFilter
                  startSelected={selectedFilters.start}
                  endSelected={selectedFilters.end}
                  duration={selectedFilters.duration}
                  startTimeLimit={startTimeLimit}
                  onSelectTimeInterval={handleSelectTimeInterval}
                />
              </ToolbarItem>

              <ToolbarItem>
                <UpdateMetricsButton
                  isLoading={isRefetching}
                  isDisabled={!!selectedFilters.end}
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
