import { MouseEvent as ReactMouseEvent, useLayoutEffect, useRef, useState } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';

import { getTestsIds } from '@config/testIds';
import MainContainer from '@layout/MainContainer';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import TopologyComponent from '../components/TopologyComponent';
import TopologyProcesses from '../components/TopologyProcesses';
import TopologySite from '../components/TopologySite';
import { TopologyController } from '../services';
import { TopologyLabels, TopologyURLQueyParams, TopologyViews } from '../Topology.enum';

const Topology = function () {
  const [searchParams] = useSearchParams();

  const serviceIdsString = searchParams.get(TopologyURLQueyParams.ServiceId) || undefined;
  const idsString = useRef(searchParams.get(TopologyURLQueyParams.IdSelected) || undefined);
  const type = searchParams.get(TopologyURLQueyParams.Type);

  const [tabSelected, setTabSelected] = useState<string>(type || TopologyViews.Sites);

  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected, true);

  function handleChangeTab(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as string);
    idsString.current = undefined;
  }

  const serviceIds = TopologyController.transformStringIdsToIds(serviceIdsString);
  // IdsSting can be a site,component, process or a pairs. Avoid pairs IDS to be selected from URL
  const ids = !TopologyController.arePairIds(idsString.current)
    ? TopologyController.transformStringIdsToIds(idsString.current)
    : undefined;

  useLayoutEffect(() => {
    //Path global update button position to be alligned with the current title
    const skUpdateButton = document.querySelector('#sk-update-data-button') as HTMLButtonElement | null;

    if (!skUpdateButton) {
      return;
    }

    const oldTop = skUpdateButton.offsetTop;

    skUpdateButton.style.position = 'absolute';
    skUpdateButton.style.top = `12px`;
    skUpdateButton.style.right = '0px';

    return () => {
      skUpdateButton.style.position = 'relative';
      skUpdateButton.style.top = `${oldTop}px`;
    };
  });

  return (
    <MainContainer
      dataTestId={getTestsIds.topologyView()}
      isPlain
      title={TopologyLabels.Topology}
      description={TopologyLabels.Description}
      hasMainContentPadding
      navigationComponent={
        <Tabs activeKey={tabSelected} onSelect={handleChangeTab}>
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
          {tabSelected === TopologyViews.Sites && <TopologySite id={ids} />}
          {tabSelected === TopologyViews.ProcessGroups && <TopologyComponent id={ids} />}
          {tabSelected === TopologyViews.Processes && <TopologyProcesses serviceIds={serviceIds} id={ids} />}
        </>
      }
    />
  );
};

export default Topology;
