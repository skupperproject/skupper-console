import { useState, FC, useEffect, memo } from 'react';

import { Toolbar, ToolbarContent, ToolbarToggleGroup, ToolbarItem, ToolbarGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { SankeyMetricOptions, ServiceClientResourceOptions, ServiceServerResourceOptions } from './SkSankey.constants';
import { MetricKeys } from '../../../types/SkSankeyChart.interfaces';
import SkSelect from '../SkSelect';

const SankeyFilter: FC<{ onSearch?: Function }> = memo(({ onSearch }) => {
  const [clientType, setClientType] = useState(ServiceClientResourceOptions[0].id);
  const [serverType, setServerType] = useState(ServiceServerResourceOptions[0].id);
  const [visibleMetrics, setVisibleMetrics] = useState('');

  const handleSelectClient = (selected?: string | number) => {
    setClientType(selected as 'client' | 'clientSite');
  };

  const handleSelectServer = (selected?: string | number) => {
    setServerType(selected as 'server' | 'serverSite');
  };

  const handleMetricSelect = (selected?: string | number) => {
    setVisibleMetrics(selected as MetricKeys | '');
  };

  useEffect(() => {
    if (onSearch) {
      onSearch({ serverType, clientType, visibleMetrics });
    }
  }, [onSearch, clientType, visibleMetrics, serverType]);

  return (
    <Toolbar data-testid="sankey-filter" collapseListedFiltersBreakpoint="xl">
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <SkSelect selected={clientType} items={ServiceClientResourceOptions} onSelect={handleSelectClient} />
            </ToolbarItem>

            <ToolbarItem>
              <SkSelect selected={serverType} items={ServiceServerResourceOptions} onSelect={handleSelectServer} />
            </ToolbarItem>
          </ToolbarGroup>

          <ToolbarItem>
            <SkSelect selected={visibleMetrics} items={SankeyMetricOptions} onSelect={handleMetricSelect} />
          </ToolbarItem>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
});

export default SankeyFilter;
