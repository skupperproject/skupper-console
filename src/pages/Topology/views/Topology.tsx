import { MouseEvent as ReactMouseEvent, useRef, useState } from 'react';

import { Card, CardBody, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';

import { getTestsIds } from '../../../config/testIds';
import useUpdateQueryStringValueWithoutNavigation from '../../../hooks/useUpdateQueryStringValueWithoutNavigation';
import MainContainer from '../../../layout/MainContainer';
import { ComponentRoutesPaths } from '../../Components/Components.enum';
import { ProcessesRoutesPaths } from '../../Processes/Processes.enum';
import { SitesRoutesPaths } from '../../Sites/Sites.enum';
import TopologyComponent from '../components/TopologyComponent';
import TopologyProcesses from '../components/TopologyProcesses';
import TopologySite from '../components/TopologySite';
import { TopologyController } from '../services';
import { TopologyLabels, TopologyURLQueyParams, TopologyViews } from '../Topology.enum';

const links: Record<string, { linkToPage: string; linkLabel: string }> = {
  [TopologyViews.Sites]: { linkToPage: SitesRoutesPaths.Sites, linkLabel: TopologyLabels.ListView },
  [TopologyViews.Components]: { linkToPage: ComponentRoutesPaths.Components, linkLabel: TopologyLabels.ListView },
  [TopologyViews.Processes]: { linkToPage: ProcessesRoutesPaths.Processes, linkLabel: TopologyLabels.ListView }
};
const Topology = function () {
  const [searchParams] = useSearchParams();

  const serviceIdsString = useRef(searchParams.get(TopologyURLQueyParams.ServiceId) || undefined);
  const idsString = useRef(searchParams.get(TopologyURLQueyParams.IdSelected) || undefined);
  const type = searchParams.get(TopologyURLQueyParams.Type);

  const [tabSelected, setTabSelected] = useState<string>(type || TopologyViews.Sites);

  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected, true);

  function handleChangeTab(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as string);
    idsString.current = undefined;
    serviceIdsString.current = undefined;
  }

  const serviceIds = TopologyController.transformStringIdsToIds(serviceIdsString.current);
  // IdsSting can be a site,component, process or a pairs. Avoid pairs IDS to be selected from URL
  const ids = TopologyController.transformStringIdsToIds(idsString.current);

  return (
    <MainContainer
      dataTestId={getTestsIds.topologyView()}
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
          {tabSelected === TopologyViews.Sites && (
            <Card isFullHeight isPlain>
              <CardBody>
                <TopologySite ids={ids} />
              </CardBody>
            </Card>
          )}
          {tabSelected === TopologyViews.Components && (
            <Card isFullHeight isPlain>
              <CardBody>
                <TopologyComponent ids={ids} />
              </CardBody>
            </Card>
          )}
          {tabSelected === TopologyViews.Processes && (
            <Card isFullHeight isPlain>
              <CardBody>
                <TopologyProcesses serviceIds={serviceIds} ids={ids} />
              </CardBody>
            </Card>
          )}
        </>
      }
    />
  );
};

export default Topology;
