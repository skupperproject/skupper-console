import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';

import { getTestsIds } from '@config/testIds';
import MainContainer from '@layout/MainContainer';

import TopologyProcesses from '../components/TopologyProcesses';
import TopologyProcessGroups from '../components/TopologyProcessGroups';
import TopologySite from '../components/TopologySite';
import { TopologyURLQueyParams, TopologyViews } from '../Topology.enum';

const Topology = function () {
  const [searchParams, setSearchParams] = useSearchParams();

  const serviceId = useRef(searchParams.get(TopologyURLQueyParams.ServiceId) || undefined);
  const id = useRef(searchParams.get(TopologyURLQueyParams.IdSelected) || undefined);
  const type = searchParams.get(TopologyURLQueyParams.Type);

  const [topologyType, setTopologyType] = useState<string>(type || TopologyViews.Sites);

  function handleChangeTopologyType(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTopologyType(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  useEffect(() => {
    // reset serviceId and id when they are received from the URL
    searchParams?.delete(TopologyURLQueyParams.IdSelected);
    searchParams?.delete(TopologyURLQueyParams.ServiceId);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  return (
    <MainContainer
      dataTestId={getTestsIds.topologyView()}
      isPlain
      hasMainContentPadding
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
          {topologyType === TopologyViews.ProcessGroups && <TopologyProcessGroups id={id.current} />}
          {topologyType === TopologyViews.Processes && (
            <TopologyProcesses serviceIds={serviceId.current ? [serviceId.current] : undefined} id={id.current} />
          )}
        </>
      }
    />
  );
};

export default Topology;
