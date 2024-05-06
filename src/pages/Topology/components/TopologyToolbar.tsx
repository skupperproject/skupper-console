import React, { useCallback } from 'react';

import { Toolbar, ToolbarContent, ToolbarItem, ToolbarGroup, Checkbox, Button, Tooltip } from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';

import { GraphNode } from '@core/components/Graph/Graph.interfaces';
import NavigationViewLink from '@core/components/NavigationViewLink';

import DisplayOptions from './DisplayOptions';
import DisplayResources from './DisplayResources';
import DisplayServices from './DisplayServices';
import {
  ROTATE_LINK_LABEL,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_LINK_PROTOCOL,
  SHOW_LINK_REVERSE_LABEL,
  SHOW_ROUTER_LINKS
} from '../Topology.constants';
import { TopologyLabels } from '../Topology.enum';
import { DisplaySelectProps } from '../Topology.interfaces';

interface ToolbarProps {
  nodes: GraphNode[];
  onSelected?: (id?: string) => void;
  displayOptions?: DisplaySelectProps[];
  onDisplayOptionSelected?: (options: string[]) => void;
  defaultDisplayOptionsSelected?: string[];
  nodeIdSelected?: string;
  showOnlyNeighbours?: boolean;
  onShowOnlyNeighboursChecked?: (checked: boolean) => void;
  moveToNodeSelected?: boolean;
  onMoveToNodeSelectedChecked?: (checked: boolean) => void;
  serviceIdsSelected?: string[];
  onServiceSelected?: (ids: string[] | undefined) => void;
  onLoadTopology?: () => void;
  onSaveTopology?: () => void;
  linkToPage: string;
  resourcePlaceholder: string;
}

const TopologyToolbar: React.FC<ToolbarProps> = function ({
  nodes,
  onSelected,
  displayOptions,
  onDisplayOptionSelected,
  defaultDisplayOptionsSelected,
  nodeIdSelected,
  showOnlyNeighbours,
  onShowOnlyNeighboursChecked,
  moveToNodeSelected,
  onMoveToNodeSelectedChecked,
  serviceIdsSelected,
  onServiceSelected,
  onLoadTopology,
  onSaveTopology,
  linkToPage,
  resourcePlaceholder
}) {
  const isLinkOptionActive = useCallback(
    () =>
      defaultDisplayOptionsSelected?.includes(SHOW_LINK_BYTES) ||
      defaultDisplayOptionsSelected?.includes(SHOW_LINK_BYTERATE) ||
      defaultDisplayOptionsSelected?.includes(SHOW_LINK_LATENCY),
    [defaultDisplayOptionsSelected]
  );

  const isRotateOptionActive = useCallback(
    () => isLinkOptionActive() || defaultDisplayOptionsSelected?.includes(SHOW_LINK_PROTOCOL) || [isLinkOptionActive],
    [defaultDisplayOptionsSelected, isLinkOptionActive]
  );

  const getDisplayOptions = useCallback(
    () =>
      (displayOptions || []).map((option) => {
        if (option.key === SHOW_LINK_BYTES || option.key === SHOW_LINK_BYTERATE || option.key === SHOW_LINK_LATENCY) {
          return {
            ...option,
            isDisabled: () => defaultDisplayOptionsSelected?.includes(SHOW_ROUTER_LINKS)
          };
        }

        if (option.key === SHOW_LINK_REVERSE_LABEL) {
          return {
            ...option,
            isDisabled: () => defaultDisplayOptionsSelected?.includes(SHOW_ROUTER_LINKS) || !isLinkOptionActive()
          };
        }

        if (option.key === ROTATE_LINK_LABEL) {
          return {
            ...option,
            isDisabled: () => defaultDisplayOptionsSelected?.includes(SHOW_ROUTER_LINKS) || !isRotateOptionActive()
          };
        }

        return option;
      }),
    [defaultDisplayOptionsSelected, displayOptions, isLinkOptionActive, isRotateOptionActive]
  );

  return (
    <Toolbar>
      <ToolbarContent>
        {onDisplayOptionSelected && (
          <>
            <ToolbarItem>
              <DisplayOptions
                options={getDisplayOptions()}
                onSelected={onDisplayOptionSelected}
                defaultSelected={defaultDisplayOptionsSelected}
              />
            </ToolbarItem>

            <ToolbarItem variant="separator" />
          </>
        )}

        {onSelected && (
          <>
            <ToolbarGroup>
              <ToolbarItem data-testid="display-resources">
                <DisplayResources
                  id={nodeIdSelected}
                  onSelect={onSelected}
                  placeholder={resourcePlaceholder}
                  options={nodes.map((node) => ({ name: node.label, identity: node.id }))}
                />
              </ToolbarItem>

              <ToolbarItem data-testid="show-only-neighbours-checkbox">
                <Checkbox
                  label={TopologyLabels.CheckboxShowOnlyNeghbours}
                  isDisabled={!nodeIdSelected}
                  isChecked={showOnlyNeighbours}
                  onChange={(_, checked) => {
                    onShowOnlyNeighboursChecked?.(checked);
                  }}
                  id="showOnlyNeighboursCheckbox"
                />
              </ToolbarItem>

              <ToolbarItem data-testid="move-to-node-selected-checkbox">
                <Checkbox
                  label={TopologyLabels.CheckboxMoveToNodeSelected}
                  isDisabled={!nodeIdSelected || showOnlyNeighbours}
                  isChecked={moveToNodeSelected}
                  onChange={(_, checked) => {
                    onMoveToNodeSelectedChecked?.(checked);
                  }}
                  id="moveToNodeSelectedCheckbox"
                />
              </ToolbarItem>
            </ToolbarGroup>

            <ToolbarItem variant="separator" />
          </>
        )}

        {onServiceSelected && (
          <>
            <ToolbarGroup>
              <ToolbarItem>
                <DisplayServices initialIdsSelected={serviceIdsSelected} onSelected={onServiceSelected} />
              </ToolbarItem>

              <ToolbarItem>
                <Button onClick={onLoadTopology} variant="secondary">
                  {TopologyLabels.LoadButton}
                </Button>
                <Tooltip content={TopologyLabels.DescriptionButton}>
                  <Button variant="plain">
                    <QuestionCircleIcon />
                  </Button>
                </Tooltip>
              </ToolbarItem>
            </ToolbarGroup>

            <ToolbarItem variant="separator" />
          </>
        )}

        {onSaveTopology && (
          <ToolbarItem>
            <Button onClick={onSaveTopology} variant="secondary">
              {TopologyLabels.SaveButton}
            </Button>
          </ToolbarItem>
        )}

        <ToolbarItem align={{ default: 'alignRight' }}>
          <NavigationViewLink link={linkToPage} linkLabel={TopologyLabels.ListView} iconName="listIcon" />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default TopologyToolbar;
