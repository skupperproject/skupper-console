import { MouseEvent as ReactMouseEvent, useState } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';

import { getTestsIds } from '@config/testIds';
import MainContainer from '@layout/MainContainer';

import TopologyProcesses from '../components/TopologyProcesses';
import TopologyProcessGroups from '../components/TopologyProcessGroups';
import TopologySite from '../components/TopologySite';
import { TopologyLabels, TopologyURLQueyParams, TopologyViews } from '../Topology.enum';

const Topology = function () {
  const [searchParams, setSearchParams] = useSearchParams();

  const serviceId = searchParams.get(TopologyURLQueyParams.ServiceId) || undefined;
  const id = searchParams.get(TopologyURLQueyParams.IdSelected) || undefined;
  const type = searchParams.get(TopologyURLQueyParams.Type);

  const [topologyType, setTopologyType] = useState<string>(type || TopologyViews.Sites);

  function handleChangeTopologyType(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTopologyType(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  return (
    <MainContainer
      dataTestId={getTestsIds.topologyView()}
      isPlain
      hasMainContentPadding
      title={TopologyLabels.Topology}
      description={TopologyLabels.Description}
      navigationComponent={
        <Tabs activeKey={topologyType} onSelect={handleChangeTopologyType}>
          <Tab eventKey={TopologyViews.Sites} title={<TabTitleText>{TopologyViews.Sites}</TabTitleText>} />
          <Tab
            eventKey={TopologyViews.ProcessGroups}
            title={<TabTitleText>{TopologyViews.ProcessGroups}</TabTitleText>}
          />
          <Tab eventKey={TopologyViews.Processes} title={<TabTitleText>{TopologyViews.Processes}</TabTitleText>} />
        </Tabs>
      }
      mainContentChildren={
        <>
          {topologyType === TopologyViews.Sites && <TopologySite />}
          {topologyType === TopologyViews.ProcessGroups && <TopologyProcessGroups id={id} />}
          {topologyType === TopologyViews.Processes && <TopologyProcesses serviceId={serviceId} id={id} />}
        </>
      }
    />
  );
};

export default Topology;
