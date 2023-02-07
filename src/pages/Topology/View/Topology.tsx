import React, { useState } from 'react';

import { Card, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';

import TopologyProcesses from '../components/TopologyProcesses';
import TopologyProcessGroups from '../components/TopologyProcessGroups';
import TopologySite from '../components/TopologySite';
import { TopologyURLFilters, TopologyViews } from '../Topology.enum';

const Topology = function () {
    const [searchParams] = useSearchParams();
    const addressId = searchParams.get(TopologyURLFilters.AddressId);
    const id = searchParams.get(TopologyURLFilters.IdSelected);

    const type = searchParams.get(TopologyURLFilters.Type);

    const [topologyType, setTopologyType] = useState<string>(type || TopologyViews.Sites);

    function handleChangeTopologyType(
        _: React.MouseEvent<HTMLElement, MouseEvent>,
        tabIndex: string | number,
    ) {
        searchParams.delete('id');
        setTopologyType(tabIndex as string);
    }

    return (
        <Card isFullHeight>
            <Tabs activeKey={topologyType} isFilled onSelect={handleChangeTopologyType} isBox>
                <Tab
                    eventKey={TopologyViews.Sites}
                    title={<TabTitleText>{TopologyViews.Sites}</TabTitleText>}
                />
                <Tab
                    eventKey={TopologyViews.ProcessGroups}
                    title={<TabTitleText>{TopologyViews.ProcessGroups}</TabTitleText>}
                />
                <Tab
                    eventKey={TopologyViews.Processes}
                    title={<TabTitleText>{TopologyViews.Processes}</TabTitleText>}
                />
            </Tabs>
            {topologyType === TopologyViews.Sites && <TopologySite />}
            {topologyType === TopologyViews.ProcessGroups && <TopologyProcessGroups id={id} />}
            {topologyType === TopologyViews.Processes && (
                <TopologyProcesses addressId={addressId} id={id} />
            )}
        </Card>
    );
};

export default Topology;
