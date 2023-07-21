import { MouseEvent as ReactMouseEvent, useState } from 'react';

import { Tab, Tabs, TabTitleIcon, TabTitleText } from '@patternfly/react-core';
import { CogIcon, CogsIcon, ProjectDiagramIcon } from '@patternfly/react-icons';
import { useSearchParams } from 'react-router-dom';

import SkDefaultPage from '@layout/DefaultPage';

import TopologyProcesses from '../components/TopologyProcesses';
import TopologyProcessGroups from '../components/TopologyProcessGroups';
import TopologySite from '../components/TopologySite';
import { TopologyLabels, TopologyURLFilters, TopologyViews } from '../Topology.enum';

const Topology = function () {
  const [searchParams, setSearchParams] = useSearchParams();

  const addressId = searchParams.get(TopologyURLFilters.AddressId);
  const id = searchParams.get(TopologyURLFilters.IdSelected) || undefined;
  const type = searchParams.get(TopologyURLFilters.Type);

  const [topologyType, setTopologyType] = useState<string>(type || TopologyViews.Sites);

  function handleChangeTopologyType(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTopologyType(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  return (
    <SkDefaultPage
      isPlain
      hasMainContentPadding
      title={TopologyLabels.Topology}
      navigationComponent={
        <Tabs activeKey={topologyType} onSelect={handleChangeTopologyType}>
          <Tab
            eventKey={TopologyViews.Sites}
            title={
              <>
                <TabTitleIcon>
                  <ProjectDiagramIcon />
                </TabTitleIcon>{' '}
                <TabTitleText>{TopologyViews.Sites}</TabTitleText>
              </>
            }
          />
          <Tab
            eventKey={TopologyViews.ProcessGroups}
            title={
              <>
                <TabTitleIcon>
                  <CogsIcon />
                </TabTitleIcon>{' '}
                <TabTitleText>{TopologyViews.ProcessGroups}</TabTitleText>
              </>
            }
          />
          <Tab
            eventKey={TopologyViews.Processes}
            title={
              <>
                <TabTitleIcon>
                  <CogIcon />
                </TabTitleIcon>{' '}
                <TabTitleText>{TopologyViews.Processes}</TabTitleText>
              </>
            }
          />
        </Tabs>
      }
      mainContentChildren={
        <>
          {topologyType === TopologyViews.Sites && <TopologySite />}
          {topologyType === TopologyViews.ProcessGroups && <TopologyProcessGroups id={id} />}
          {topologyType === TopologyViews.Processes && <TopologyProcesses addressId={addressId} id={id} />}
        </>
      }
    />
  );
};

export default Topology;
