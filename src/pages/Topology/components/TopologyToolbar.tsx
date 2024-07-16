import { FC } from 'react';

import { Toolbar, ToolbarContent, ToolbarItem, ToolbarGroup } from '@patternfly/react-core';

import DisplayOptions from './DisplayOptions';
import DisplayResources from './DisplayResources';
import DisplayServices from './DisplayServices';
import {
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_LINK_REVERSE_LABEL,
  SHOW_ROUTER_LINKS
} from '../Topology.constants';
import { DisplaySelectProps } from '../Topology.interfaces';

interface ToolbarProps {
  displayOptions?: DisplaySelectProps[][];
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
  displayOptions = [[]],
  onDisplayOptionSelected,
  defaultDisplayOptionsSelected = [],
  // showOnlyNeighbours,
  // onShowOnlyNeighboursChecked,
  // moveToNodeSelected,
  // onMoveToNodeSelectedChecked,
  serviceIdsSelected,
  onServiceSelected,
  resourcePlaceholder,
  onResourceSelected
}) {
  const displayOptionsDisabled = {
    [SHOW_LINK_BYTES]: !!defaultDisplayOptionsSelected.includes(SHOW_ROUTER_LINKS),
    [SHOW_LINK_BYTERATE]: !!defaultDisplayOptionsSelected.includes(SHOW_ROUTER_LINKS),
    [SHOW_LINK_LATENCY]: !!defaultDisplayOptionsSelected.includes(SHOW_ROUTER_LINKS),
    [SHOW_LINK_REVERSE_LABEL]:
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

            {/* <ToolbarItem data-testid="show-only-neighbours-checkbox">
              <Checkbox
                label={TopologyLabels.CheckboxShowOnlyNeghbours}
                isDisabled={!resourceIdSelected}
                isChecked={!!resourceIdSelected && showOnlyNeighbours}
                onChange={(_, checked) => {
                  onShowOnlyNeighboursChecked?.(checked);
                }}
                id="showOnlyNeighboursCheckbox"
              />
            </ToolbarItem>

            <ToolbarItem data-testid="move-to-node-selected-checkbox">
              <Checkbox
                label={TopologyLabels.CheckboxMoveToNodeSelected}
                isDisabled={!resourceIdSelected || showOnlyNeighbours}
                isChecked={!!resourceIdSelected && moveToNodeSelected}
                onChange={(_, checked) => {
                  onMoveToNodeSelectedChecked?.(checked);
                }}
                id="moveToNodeSelectedCheckbox"
              />
            </ToolbarItem> */}
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
