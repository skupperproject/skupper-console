import React from 'react';

import {
  TextContent,
  Text,
  TextVariants,
  ActionList,
  ActionListItem,
  Button,
  Flex,
  Tooltip,
} from '@patternfly/react-core';
import { PencilAltIcon, SyncAltIcon } from '@patternfly/react-icons';

const SiteMenu = function () {
  return (
    <Flex className="pf-u-box-shadow-sm-bottom pf-u-py-sm pf-u-px-xl">
      <TextContent>
        <Text component={TextVariants.h3}>Private one Hipster</Text>
      </TextContent>
      <ActionList isIconList>
        <ActionListItem>
          <Tooltip content="Edit the site name">
            <Button variant="plain" aria-label="Edit name icon button">
              <PencilAltIcon />
            </Button>
          </Tooltip>
        </ActionListItem>
        <ActionListItem>
          <Tooltip content="Regenerate site CA">
            <Button variant="plain" aria-label="Regenerate site CA icon button">
              <SyncAltIcon />
            </Button>
          </Tooltip>
        </ActionListItem>
      </ActionList>
    </Flex>
  );
};

export default SiteMenu;
