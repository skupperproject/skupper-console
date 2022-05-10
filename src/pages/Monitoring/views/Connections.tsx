import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Tab,
    Tabs,
    TabTitleText,
    Stack,
    StackItem,
} from '@patternfly/react-core';
import { Link, useParams } from 'react-router-dom';

import ConnectionsTableVIew from '../components/table';
import ConnectionsTopology from '../components/topology';
import {
    MonitoringRoutesPaths,
    MonitoringRoutesPathLabel,
    ConnectionsNavMenu,
} from '../Monitoring.enum';

const Connections = function () {
    const [activeItem, setActiveItem] = useState(0);
    const { id: vanId } = useParams();

    function handleNavSelect(_: React.MouseEvent, itemId: string | number) {
        setActiveItem(itemId as number);
    }

    return (
        <Stack data-cy="sk-monitoring-service">
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={MonitoringRoutesPaths.Monitoring}>
                            {MonitoringRoutesPathLabel.Monitoring}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{vanId}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>
            <StackItem>
                <Tabs
                    activeKey={activeItem}
                    onSelect={handleNavSelect}
                    id="open-tabs-example-tabs-list"
                >
                    <Tab
                        eventKey={0}
                        title={<TabTitleText> {ConnectionsNavMenu.Table}</TabTitleText>}
                        tabContentId={`tabContent${0}`}
                    />
                    <Tab
                        eventKey={1}
                        title={<TabTitleText> {ConnectionsNavMenu.Topology}</TabTitleText>}
                        tabContentId={`tabContent${1}`}
                    />
                </Tabs>
            </StackItem>
            <StackItem isFilled>
                {activeItem ? <ConnectionsTopology /> : <ConnectionsTableVIew />}
            </StackItem>
        </Stack>
    );
};

export default Connections;
