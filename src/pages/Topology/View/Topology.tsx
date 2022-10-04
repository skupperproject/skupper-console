import React, { useState } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import TopologyProcesses from '../components/TopologyProcesses';
import TopologyProcessGroups from '../components/TopologyProcessGroups';
import TopologySite from '../components/TopologySite';
import { TopologyViews } from '../Topology.enum';

const TopologyContent = function () {
    const [topologyType, setTopologyType] = useState<string>(TopologyViews.Sites);

    function handleChangeTopologyType(
        _: React.MouseEvent<HTMLElement, MouseEvent>,
        tabIndex: string | number,
    ) {
        setTopologyType(tabIndex as string);
    }

    return (
        <>
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
            {topologyType === TopologyViews.ProcessGroups && <TopologyProcessGroups />}
            {topologyType === TopologyViews.Processes && <TopologyProcesses />}
        </>
    );
};

export default TopologyContent;
