import React from 'react';

import { Button, Toolbar, ToolbarContent, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { SyncIcon } from '@patternfly/react-icons';
import { useQueryClient } from '@tanstack/react-query';

const TOOLTIP_TEXT = 'Synchronize skupper  data';

const AppMenu = function () {
  const queryClient = useQueryClient();

  function handleRefetchQueries() {
    queryClient.refetchQueries({ type: 'active' });
  }

  return (
    <Toolbar isFullHeight>
      <ToolbarContent>
        <ToolbarItem alignment={{ default: 'alignRight' }}>
          <Tooltip content={TOOLTIP_TEXT}>
            <Button variant="plain" aria-label="sync" onClick={handleRefetchQueries}>
              <SyncIcon color="var(--pf-global--palette--blue-400)" />
            </Button>
          </Tooltip>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default AppMenu;
