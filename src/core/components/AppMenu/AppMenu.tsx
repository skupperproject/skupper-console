import React from 'react';

import {
  Breadcrumb,
  BreadcrumbHeading,
  BreadcrumbItem,
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import { SyncIcon } from '@patternfly/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';

import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';

const TOOLTIP_TEXT = 'Synchronize skupper  data';

const AppMenu = function () {
  const { pathname } = useLocation();

  const queryClient = useQueryClient();

  const paths = pathname.split('/').filter(Boolean);
  const pathsNormalized = paths.map((path) => getIdAndNameFromUrlParams(path));
  const lastPath = pathsNormalized.pop();

  function handleRefetchQueries() {
    queryClient.refetchQueries({ type: 'active' });
  }

  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem>
          <Breadcrumb>
            {pathsNormalized.map((path, index) => (
              <BreadcrumbItem key={path.name}>
                <Link to={[...paths].slice(0, index + 1).join('/')}>{path.name}</Link>
              </BreadcrumbItem>
            ))}
            <BreadcrumbHeading to="#">{lastPath?.name}</BreadcrumbHeading>
          </Breadcrumb>
        </ToolbarItem>
        <ToolbarItem alignment={{ default: 'alignRight' }}>
          <Tooltip content={TOOLTIP_TEXT}>
            <Button onClick={handleRefetchQueries} variant="tertiary" isSmall>
              <SyncIcon />
            </Button>
          </Tooltip>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default AppMenu;
