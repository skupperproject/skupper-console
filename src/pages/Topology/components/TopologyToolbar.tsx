import { FC } from 'react';

import { Toolbar, ToolbarContent, ToolbarItem, ToolbarGroup } from '@patternfly/react-core';

import { SkSelectGroupedOptions } from '@core/components/SkSelect';

import DisplayOptions from './DisplayOptions';
import DisplayResources from './DisplayResources';
import DisplayServices from './DisplayServices';
import {
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_INBOUND_METRICS,
  SHOW_ROUTER_LINKS,
  SHOW_LINK_METRIC_DISTRIBUTION,
  SHOW_LINK_METRIC_VALUE
} from '../Topology.constants';

interface ToolbarProps {
  displayOptions?: SkSelectGroupedOptions[];
  onDisplayOptionSelected?: (options: string[]) => void;
  defaultDisplayOptionsSelected?: string[];
  showOnlyNeighbours?: boolean;
  onShowOnlyNeighboursChecked?: (checked: boolean) => void;
  moveToNodeSelected?: boolean;
  onMoveToNodeSelectedChecked?: (checked: boolean) => void;
  serviceIdsSelected?: string[];
  onServiceSelected?: (ids: string[] | undefined) => void;
  onResourceSelected?: (id: string) => void;
  resourcePlaceholder: string;
}

const TopologyToolbar: FC<ToolbarProps> = function ({
  displayOptions = [],
  onDisplayOptionSelected,
  defaultDisplayOptionsSelected = [],
  serviceIdsSelected,
  onServiceSelected,
  resourcePlaceholder,
  onResourceSelected
}) {
  const displayOptionsDisabled = {
    [SHOW_LINK_BYTES]: !!defaultDisplayOptionsSelected.includes(SHOW_ROUTER_LINKS),
    [SHOW_LINK_BYTERATE]: !!defaultDisplayOptionsSelected.includes(SHOW_ROUTER_LINKS),
    [SHOW_LINK_LATENCY]: !!defaultDisplayOptionsSelected.includes(SHOW_ROUTER_LINKS),
    [SHOW_INBOUND_METRICS]:
      defaultDisplayOptionsSelected.includes(SHOW_ROUTER_LINKS) ||
      !defaultDisplayOptionsSelected.includes(SHOW_LINK_METRIC_VALUE) ||
      !areMetricAvailable(defaultDisplayOptionsSelected),
    [SHOW_LINK_METRIC_DISTRIBUTION]:
      defaultDisplayOptionsSelected.includes(SHOW_ROUTER_LINKS) || !areMetricAvailable(defaultDisplayOptionsSelected),
    [SHOW_LINK_METRIC_VALUE]:
      defaultDisplayOptionsSelected.includes(SHOW_ROUTER_LINKS) || !areMetricAvailable(defaultDisplayOptionsSelected)
  };

  return (
    <Toolbar>
      <ToolbarContent>
        {onDisplayOptionSelected && (
          <>
            <ToolbarItem>
              <DisplayOptions
                onSelected={onDisplayOptionSelected}
                defaultSelected={defaultDisplayOptionsSelected}
                options={displayOptions}
                optionsDisabled={displayOptionsDisabled}
              />
            </ToolbarItem>

            <ToolbarItem variant="separator" />
          </>
        )}

        {onServiceSelected && (
          <ToolbarGroup>
            <ToolbarItem>
              <DisplayServices initialIdsSelected={serviceIdsSelected} onSelected={onServiceSelected} />
            </ToolbarItem>
          </ToolbarGroup>
        )}

        {onResourceSelected && (
          <ToolbarGroup>
            <ToolbarItem data-testid="display-resources">
              <DisplayResources placeholder={resourcePlaceholder} onSelect={onResourceSelected} />
            </ToolbarItem>
          </ToolbarGroup>
        )}
      </ToolbarContent>
    </Toolbar>
  );
};

export default TopologyToolbar;

const areMetricAvailable = (displayOptionsSelected: string[] = []) =>
  displayOptionsSelected?.includes(SHOW_LINK_BYTES) ||
  displayOptionsSelected?.includes(SHOW_LINK_BYTERATE) ||
  displayOptionsSelected?.includes(SHOW_LINK_LATENCY);
