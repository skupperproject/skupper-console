import { useState, MouseEvent as ReactMouseEvent, Ref, FC, useEffect, memo } from 'react';

import {
  Toolbar,
  ToolbarContent,
  ToolbarToggleGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  ToolbarItem
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

interface FilterValues {
  [key: string]: string | undefined;
}

export const sankeyMetricOptions = [
  { id: 'none', name: 'No metric comparison' },
  { id: 'byterate', name: 'Compare avg. byterate (last hour)' }
];

export const ServiceClientResourceOptions: { name: string; id: 'client' | 'clientSite' }[] = [
  {
    name: 'Client sites',
    id: 'clientSite'
  },
  {
    name: 'Client processes',
    id: 'client'
  }
];

export const ServiceServerResourceOptions: { name: string; id: 'server' | 'serverSite' }[] = [
  {
    name: 'Server sites',
    id: 'serverSite'
  },
  {
    name: 'Server processes',
    id: 'server'
  }
];

const SankeyFilter: FC<{ onSearch?: Function }> = memo(({ onSearch }) => {
  const [isClientExpanded, setIsClientExpanded] = useState(false);
  const [isServerExpanded, setIsServerExpanded] = useState(false);
  const [isMetricsExpanded, setIsMetricExpanded] = useState(false);

  const [clientType, setClientType] = useState(ServiceClientResourceOptions[0].id);
  const [serverType, setServerType] = useState(ServiceServerResourceOptions[0].id);

  const [visibleMetrics, setVisibleMetrics] = useState(sankeyMetricOptions[0].id);

  const handleSelectClient = (_?: ReactMouseEvent<Element, MouseEvent>, selected?: string | number) => {
    const selection = selected as keyof FilterValues;

    setClientType(selection as 'client' | 'clientSite');
    setIsClientExpanded(false);
  };

  const handleSelectServer = (_?: ReactMouseEvent<Element, MouseEvent>, selected?: string | number) => {
    const selection = selected as keyof FilterValues;

    setServerType(selection as 'server' | 'serverSite');
    setIsServerExpanded(false);
  };

  const handleMetricSelect = (_?: ReactMouseEvent<Element, MouseEvent>, selected?: string | number) => {
    const selection = selected as keyof FilterValues;

    setVisibleMetrics(selection as string);
    setIsMetricExpanded(false);
  };

  const handleClientToggle = () => {
    setIsClientExpanded(!isClientExpanded);
  };

  const handleServerToggle = () => {
    setIsServerExpanded(!isServerExpanded);
  };

  const handleMetricsToggle = () => {
    setIsMetricExpanded(!isMetricsExpanded);
  };

  useEffect(() => {
    if (onSearch) {
      onSearch({ serverType, clientType, visibleMetrics });
    }
  }, [onSearch, clientType, visibleMetrics, serverType]);

  const clientMenuItems = ServiceClientResourceOptions.map((option) => (
    <SelectOption key={option.id} value={option.id}>
      {option.name}
    </SelectOption>
  ));

  const serverMenuItems = ServiceServerResourceOptions.map((option) => (
    <SelectOption key={option.id} value={option.id}>
      {option.name}
    </SelectOption>
  ));

  const metricMenuItems = sankeyMetricOptions.map((option) => (
    <SelectOption key={option.id} value={option.id}>
      {option.name}
    </SelectOption>
  ));

  const filterClientSelected = ServiceClientResourceOptions.find(({ id }) => id === clientType)?.name;
  const filterServerSelected = ServiceServerResourceOptions.find(({ id }) => id === serverType)?.name;
  const metricNameSelected = sankeyMetricOptions.find(({ id }) => id === visibleMetrics)?.name;

  const toggleGroupItems = (
    <>
      <ToolbarItem variant="label" id="stacked-example-resource-select">
        From
      </ToolbarItem>

      <ToolbarItem>
        <Select
          role="menu"
          toggle={(toggleRef: Ref<MenuToggleElement>) => (
            <MenuToggle ref={toggleRef} onClick={handleClientToggle} isExpanded={isClientExpanded}>
              {filterClientSelected}
            </MenuToggle>
          )}
          onSelect={handleSelectClient}
          selected={clientType}
          isOpen={isClientExpanded}
          onOpenChange={handleClientToggle}
        >
          <SelectList>{clientMenuItems}</SelectList>
        </Select>
      </ToolbarItem>

      <ToolbarItem variant="label" id="stacked-example-resource-select">
        To
      </ToolbarItem>

      <ToolbarItem>
        <Select
          role="menu"
          toggle={(toggleRef: Ref<MenuToggleElement>) => (
            <MenuToggle ref={toggleRef} onClick={handleServerToggle} isExpanded={isServerExpanded}>
              {filterServerSelected}
            </MenuToggle>
          )}
          onSelect={handleSelectServer}
          selected={serverType}
          isOpen={isServerExpanded}
          onOpenChange={handleServerToggle}
        >
          <SelectList>{serverMenuItems}</SelectList>
        </Select>
      </ToolbarItem>

      <ToolbarItem>
        <Select
          role="menu"
          toggle={(toggleRef: Ref<MenuToggleElement>) => (
            <MenuToggle ref={toggleRef} onClick={handleMetricsToggle} isExpanded={isMetricsExpanded}>
              {metricNameSelected}
            </MenuToggle>
          )}
          onSelect={handleMetricSelect}
          selected={visibleMetrics}
          isOpen={isMetricsExpanded}
          onOpenChange={handleMetricsToggle}
        >
          <SelectList>{metricMenuItems}</SelectList>
        </Select>
      </ToolbarItem>
    </>
  );

  const toolbarItems = (
    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
      {toggleGroupItems}
    </ToolbarToggleGroup>
  );

  return (
    <Toolbar collapseListedFiltersBreakpoint="xl">
      <ToolbarContent>{toolbarItems}</ToolbarContent>
    </Toolbar>
  );
});

export default SankeyFilter;
