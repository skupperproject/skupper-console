import { MouseEvent as ReactMouseEvent, useRef, useState } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';

import { getTestsIds } from '@config/testIds';
import MainContainer from '@layout/MainContainer';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import TopologyProcesses from '../components/TopologyProcesses';
import TopologyProcessGroups from '../components/TopologyProcessGroups';
import TopologySite from '../components/TopologySite';
import { TopologyLabels, TopologyURLQueyParams, TopologyViews } from '../Topology.enum';

const Topology = function () {
  const [searchParams] = useSearchParams();

  const serviceId = searchParams.get(TopologyURLQueyParams.ServiceId) || undefined;
  const id = useRef(searchParams.get(TopologyURLQueyParams.IdSelected) || undefined);
  const type = searchParams.get(TopologyURLQueyParams.Type);

  const [tabSelected, setTabSelected] = useState<string>(type || TopologyViews.Sites);

  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected, true);

  function handleChangeTopologyType(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as string);
    id.current = undefined;
  }

  return (
    <MainContainer
      dataTestId={getTestsIds.topologyView()}
      isPlain
      title={TopologyLabels.Topology}
      description={TopologyLabels.Description}
      hasMainContentPadding
      navigationComponent={
        <Tabs activeKey={tabSelected} onSelect={handleChangeTopologyType}>
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
          {tabSelected === TopologyViews.Sites && <TopologySite id={id.current} />}
          {tabSelected === TopologyViews.ProcessGroups && <TopologyProcessGroups id={id.current} />}
          {tabSelected === TopologyViews.Processes && (
            <TopologyProcesses serviceIds={serviceId ? [serviceId] : undefined} id={id.current} />
          )}
        </>
      }
    />
  );
};

export default Topology;
