import { FC, memo } from 'react';

import { Toolbar, ToolbarContent, ToolbarItem, ToolbarGroup, PageSection } from '@patternfly/react-core';
import { OutlinedClockIcon } from '@patternfly/react-icons';

import { Protocols } from '@API/REST.enum';
import { timeIntervalMap } from '@config/prometheus';
import ResourceIcon from '@core/components/ResourceIcon';
import SkSelect from '@core/components/SkSelect';
import { deepMergeJSONObjects } from '@core/utils/deepMergeWithJSONObjects';
import { ConfigMetricFilters, QueryMetricsParams } from '@sk-types/Metrics.interfaces';

import useMetricFiltersState from '../hooks/useMetricFiltersState';
import { configDefaultFilters } from '../Metrics.constants';
import { MetricsLabels } from '../Metrics.enum';
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
      defaultMetricFilterValues: {
        ...defaultMetricFilterValues,
        duration: defaultMetricFilterValues.duration || config.timeInterval?.placeholder
      },
      onSelectFilters
    });

    return (
      <PageSection padding={{ default: 'noPadding' }}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                {!config.sourceSites?.hide && (
                  <SkSelect
                    selected={selectedFilters.sourceSite}
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
                  <SkSelect
                    selected={selectedFilters.sourceProcess}
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
                  <SkSelect
                    selected={selectedFilters.destSite}
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
                  <SkSelect
                    selected={selectedFilters.destProcess}
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
                  <SkSelect
                    selected={selectedFilters.protocol}
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
                <SkSelect
                  selected={selectedFilters.duration}
                  items={Object.values(timeIntervalMap).map(({ label, seconds }) => ({
                    id: seconds.toString(),
                    label
                  }))}
                  icon={<OutlinedClockIcon />}
                  onSelect={handleSelectTimeInterval}
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
