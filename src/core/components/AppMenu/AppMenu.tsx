import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import { ClockIcon, SyncIcon } from '@patternfly/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';

import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { TopologyRoutesPaths } from '@pages/Topology/Topology.enum';
import { UPDATE_INTERVAL } from 'config';

const TOOLTIP_UPDATE = 'Data Update';
const TOOLTIP_CONTINUOS_UPDATE = `Automatic data update (${UPDATE_INTERVAL} ms). PERFORMANCE MAY BE IMPACTED`!;
const COLOR_ICON_MOUSE_LEAVE = 'var(--pf-global--palette--black-500)';
const COLOR_ICON_MOUSE_ENTER = 'var(--pf-global--palette--green-500)';

const AppMenu = function () {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const intervalId = useRef<number | null>(null);
  const [updateInterval, setUpdateInterval] = useState(0);
  const [buttonAutomaticUpdateColor, setButtonAutomaticUpdateColor] = useState(COLOR_ICON_MOUSE_LEAVE);

  const paths = pathname.split('/').filter(Boolean);
  const pathsNormalized = paths.map((path) => getIdAndNameFromUrlParams(path));
  const lastPath = pathsNormalized.pop();

  const handleRefetchQueries = useCallback(() => {
    queryClient.refetchQueries({ type: 'active' });
  }, [queryClient]);

  const handleActivateRealTIme = useCallback(() => {
    setUpdateInterval(!updateInterval ? UPDATE_INTERVAL : 0);
  }, [updateInterval]);

  useEffect(() => {
    if (updateInterval) {
      intervalId.current = window.setInterval(handleRefetchQueries, updateInterval);
      handleRefetchQueries();
    }

    if (!updateInterval && intervalId.current) {
      window.clearInterval(intervalId.current);
    }
  }, [handleRefetchQueries, updateInterval]);

  function handleButtonAutomaticUpdateColorMouseEnter() {
    setButtonAutomaticUpdateColor(COLOR_ICON_MOUSE_ENTER);
  }

  function handleButtonAutomaticUpdateColorMouseOut() {
    if (!updateInterval) {
      setButtonAutomaticUpdateColor(COLOR_ICON_MOUSE_LEAVE);
    }
  }

  // TODO: topology already update automatically the data. Waiting to get push notifications from BE instead making polling
  if (pathname === TopologyRoutesPaths.Topology) {
    return null;
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
          <Tooltip content={TOOLTIP_UPDATE}>
            <Button onClick={handleRefetchQueries} variant="plain" isSmall isDisabled={!!updateInterval}>
              <SyncIcon />
            </Button>
          </Tooltip>

          <Tooltip content={TOOLTIP_CONTINUOS_UPDATE}>
            <Button
              variant="plain"
              onClick={handleActivateRealTIme}
              isSmall
              onMouseEnter={handleButtonAutomaticUpdateColorMouseEnter}
              onMouseLeave={handleButtonAutomaticUpdateColorMouseOut}
            >
              <ClockIcon color={buttonAutomaticUpdateColor} />
            </Button>
          </Tooltip>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default AppMenu;
