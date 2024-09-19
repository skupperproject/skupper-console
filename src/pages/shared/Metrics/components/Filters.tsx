import { FC, memo } from 'react';

import { Toolbar, ToolbarContent, ToolbarItem, ToolbarGroup, PageSection } from '@patternfly/react-core';

import { Protocols } from '@API/REST.enum';
import ResourceIcon from '@core/components/ResourceIcon';
import SkTimeRangeFilter from '@core/components/SkTimeRangeFilter';
import { deepMergeJSONObjects } from '@core/utils/deepMergeWithJSONObjects';
import { ConfigMetricFilters, QueryMetricsParams } from '@sk-types/Metrics.interfaces';

import { configDefaultFilters } from '../Metrics.constants';
import { MetricsLabels } from '../Metrics.enum';
import PopperSelect from './PopperSelect';
import useMetricFiltersState from '../hooks/useMetricFiltersState';
import { generateFilterItems } from '../services';

interface MetricFiltersProps {
  defaultMetricFilterValues: QueryMetricsParams;
  sourceSites?: { destinationName: string }[];
  destSites?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string; siteName?: string }[];
  destProcesses?: { destinationName: string; siteName?: string }[];
  availableProtocols?: Protocols[];
  configFilters?: ConfigMetricFilters;
  isRefetching?: boolean;
  onRefetch?: Function;
  onSelectFilters?: (params: QueryMetricsParams) => void;
}

const MetricFilters: FC<MetricFiltersProps> = memo(
  ({
    configFilters = {},
    defaultMetricFilterValues,
    sourceSites,
    destSites,
    sourceProcesses,
    destProcesses,
    availableProtocols = [Protocols.Http, Protocols.Http2, Protocols.Tcp],
    onSelectFilters
  }) => {
    const config: ConfigMetricFilters = deepMergeJSONObjects<ConfigMetricFilters>(configDefaultFilters, configFilters);

    const {
      selectedFilters,
      handleSelectSourceSite,
      handleSelectDestSite,
      handleSelectSourceProcess,
      handleSelectDestProcess,
      handleSelectProtocol,
      handleSelectTimeInterval
    } = useMetricFiltersState({
      defaultMetricFilterValues,
      onSelectFilters
    });

    return (
      <PageSection padding={{ default: 'noPadding' }}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                {!config.sourceSites?.hide && (
                  <PopperSelect
                    selectedItem={selectedFilters.sourceSite}
                    items={generateFilterItems({ data: sourceSites })}
                    onSelect={handleSelectSourceSite}
                    placeholder={config.sourceSites?.placeholder || ''}
                    icon={<ResourceIcon type="site" />}
                    isDisabled={config.sourceSites?.disabled}
                  />
                )}
              </ToolbarItem>

              <ToolbarItem>
                {!config.sourceProcesses?.hide && (
                  <PopperSelect
                    selectedItem={selectedFilters.sourceProcess}
                    items={generateFilterItems({
                      data: sourceProcesses,
                      parentSelected: selectedFilters.sourceSite
                    })}
                    onSelect={handleSelectSourceProcess}
                    placeholder={config.sourceProcesses?.placeholder || ''}
                    icon={<ResourceIcon type="process" />}
                    isDisabled={config.sourceProcesses?.disabled}
                  />
                )}
              </ToolbarItem>

              <ToolbarItem>
                {!config.destSites?.hide && (
                  <PopperSelect
                    selectedItem={selectedFilters.destSite}
                    items={generateFilterItems({ data: destSites })}
                    onSelect={handleSelectDestSite}
                    placeholder={config.destSites?.placeholder || ''}
                    icon={<ResourceIcon type="site" />}
                    isDisabled={config.destSites?.disabled}
                  />
                )}
              </ToolbarItem>

              <ToolbarItem>
                {!config.destinationProcesses?.hide && (
                  <PopperSelect
                    selectedItem={selectedFilters.destProcess}
                    items={generateFilterItems({
                      data: destProcesses,
                      parentSelected: selectedFilters.destSite
                    })}
                    onSelect={handleSelectDestProcess}
                    placeholder={config.destinationProcesses?.placeholder || ''}
                    icon={<ResourceIcon type="process" />}
                    isDisabled={config.destinationProcesses?.disabled}
                  />
                )}
              </ToolbarItem>

              {!!availableProtocols.length && (
                <ToolbarItem>
                  <PopperSelect
                    selectedItem={selectedFilters.protocol}
                    items={availableProtocols.map((name) => ({
                      id: name,
                      label: name
                    }))}
                    onSelect={handleSelectProtocol}
                    placeholder={MetricsLabels.FilterProtocolsDefault}
                  />
                </ToolbarItem>
              )}
            </ToolbarGroup>

            <ToolbarGroup align={{ default: 'alignRight' }}>
              <ToolbarItem>
                <SkTimeRangeFilter
                  duration={selectedFilters.duration}
                  onSelectTimeInterval={handleSelectTimeInterval}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
    );
  }
);

export default MetricFilters;
