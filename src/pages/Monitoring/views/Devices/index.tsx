import React, { useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbHeading,
  BreadcrumbItem,
  Nav,
  NavItem,
  NavList,
} from '@patternfly/react-core';
import { Link, Outlet, useParams } from 'react-router-dom';

import {
  MonitoringRoutesPaths,
  MonitoringRoutesPathLabel,
  DevicesNavMenu,
} from '../../Monitoring.enum';

const Devices = function () {
  const [activeItem, setActiveItem] = useState(0);
  const { id: vanId } = useParams();

  function handleNavSelect({ itemId }: { itemId: string | number }) {
    setActiveItem(itemId as number);
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={MonitoringRoutesPaths.Monitoring}>{MonitoringRoutesPathLabel.Monitoring}</Link>
        </BreadcrumbItem>
        <BreadcrumbHeading to="#">{vanId}</BreadcrumbHeading>
      </Breadcrumb>
      <Nav onSelect={handleNavSelect} variant="horizontal">
        <NavList>
          <NavItem key={0} itemId={0} isActive={activeItem === 0} href="#">
            <Link
              to={`${MonitoringRoutesPaths.Devices}/${vanId}${MonitoringRoutesPaths.DevicesTable}/`}
            >
              {DevicesNavMenu.Table}
            </Link>
          </NavItem>
        </NavList>
        <NavList>
          <NavItem key={1} itemId={1} isActive={activeItem === 1} href="#">
            <Link
              to={`${MonitoringRoutesPaths.Devices}/${vanId}${MonitoringRoutesPaths.DevicesTopology}`}
            >
              {DevicesNavMenu.Topology}
            </Link>
          </NavItem>
        </NavList>
      </Nav>
      <Outlet />
    </>
  );
};

export default Devices;
