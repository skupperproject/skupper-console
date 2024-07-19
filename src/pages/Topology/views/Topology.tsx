import { MouseEvent as ReactMouseEvent, useRef, useState } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';

import { getTestsIds } from '@config/testIds';
import MainContainer from '@layout/MainContainer';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import TopologyComponent from '../components/TopologyComponent';
import TopologyProcesses from '../components/TopologyProcesses';
import TopologySite from '../components/TopologySite';
import { TopologyController } from '../services';
import { TopologyLabels, TopologyURLQueyParams, TopologyViews } from '../Topology.enum';

const links: Record<string, { linkToPage: string; linkLabel: string }> = {
  [TopologyViews.Sites]: { linkToPage: SitesRoutesPaths.Sites, linkLabel: TopologyLabels.ListView },
  [TopologyViews.Components]: { linkToPage: ComponentRoutesPaths.ProcessGroups, linkLabel: TopologyLabels.ListView },
  [TopologyViews.Processes]: { linkToPage: ProcessesRoutesPaths.Processes, linkLabel: TopologyLabels.ListView }
};
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
  const ids = TopologyController.transformStringIdsToIds(idsString.current);

  return (
    <MainContainer
      dataTestId={getTestsIds.topologyView()}
      isPlain
      title={TopologyLabels.Topology}
      description={TopologyLabels.Description}
      hasMainContentPadding
      link={links[tabSelected].linkToPage}
      linkLabel={links[tabSelected].linkLabel}
      iconName="listIcon"
      navigationComponent={
        <Tabs activeKey={tabSelected} onSelect={handleChangeTab}>
          <Tab eventKey={TopologyViews.Sites} title={<TabTitleText>{TopologyViews.Sites}</TabTitleText>} />
          <Tab eventKey={TopologyViews.Components} title={<TabTitleText>{TopologyViews.Components}</TabTitleText>} />
          <Tab eventKey={TopologyViews.Processes} title={<TabTitleText>{TopologyViews.Processes}</TabTitleText>} />
        </Tabs>
      }
      mainContentChildren={
        <>
          {tabSelected === TopologyViews.Sites && <TopologySite ids={ids} />}
          {tabSelected === TopologyViews.Components && <TopologyComponent ids={ids} />}
          {tabSelected === TopologyViews.Processes && <TopologyProcesses serviceIds={serviceIds} ids={ids} />}
        </>
      }
    />
  );
};

export default Topology;
