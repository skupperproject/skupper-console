import { MouseEvent as ReactMouseEvent, Suspense, useState } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';

import MainContainer from '@layout/MainContainer';
import LoadingPage from '@pages/shared/Loading';

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
    <MainContainer
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
        <Suspense fallback={<LoadingPage />}>
          {topologyType === TopologyViews.Sites && <TopologySite />}
          {topologyType === TopologyViews.ProcessGroups && <TopologyProcessGroups id={id} />}
          {topologyType === TopologyViews.Processes && <TopologyProcesses addressId={addressId} id={id} />}
        </Suspense>
      }
    />
  );
};

export default Topology;
