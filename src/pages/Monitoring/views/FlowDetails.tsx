import React from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Stack,
    StackItem,
} from '@patternfly/react-core';
import { Link, useParams } from 'react-router-dom';

import FlowInfo from '../components/FlowInfo';
import FlowTopology from '../components/FlowTopology';
import { MonitoringRoutesPathLabel, MonitoringRoutesPaths } from '../Monitoring.enum';

const FlowDetails = function () {
    const { id } = useParams();
    const link = `${MonitoringRoutesPaths.Connections}/${id}`;

    return (
        <Stack hasGutter>
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={MonitoringRoutesPaths.Monitoring}>
                            {MonitoringRoutesPathLabel.Monitoring}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={link}>{id}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">flow</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>
            <StackItem>
                <FlowInfo />
                <div style={{ width: '100%', height: '700px' }}>
                    <FlowTopology />
                </div>
            </StackItem>
        </Stack>
    );
};

export default FlowDetails;
