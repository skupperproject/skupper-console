import { useState, MouseEvent as ReactMouseEvent, FC } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useParams, useSearchParams } from 'react-router-dom';

import { Labels } from '../../../config/labels';
import { getTestsIds } from '../../../config/testIds';
import { getIdAndNameFromUrlParams } from '../../../core/utils/getIdAndNameFromUrlParams';
import useUpdateQueryStringValueWithoutNavigation from '../../../hooks/useUpdateQueryStringValueWithoutNavigation';
import MainContainer from '../../../layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '../../Topology/Topology.enum';
import Details from '../components/Details';
import Links from '../components/Links';
import Overview from '../components/Overview.';
import PairsList from '../components/PairList';
import ProcessList from '../components/ProcessList';
import { useSiteData } from '../hooks/useSiteData';

interface SiteProps {
  id: string;
  defaultTab: string;
}

const SiteContent: FC<SiteProps> = function ({ id, defaultTab }) {
  const {
    site,
    summary: { processCount }
  } = useSiteData(id);

  const [tabSelected, setTabSelected] = useState(defaultTab);
  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected, true);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as string);
  }

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={Labels.Overview} title={<TabTitleText>{Labels.Overview}</TabTitleText>} />
        <Tab eventKey={Labels.Details} title={<TabTitleText>{Labels.Details}</TabTitleText>} />
        <Tab eventKey={Labels.RouterLinks} title={<TabTitleText>{Labels.RouterLinks}</TabTitleText>} />
        <Tab eventKey={Labels.Pairs} title={<TabTitleText>{Labels.Pairs}</TabTitleText>} />
        <Tab
          eventKey={Labels.Processes}
          title={<TabTitleText>{Labels.Processes}</TabTitleText>}
          disabled={!processCount}
        />
      </Tabs>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.siteView(id)}
      title={site.name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Sites}&${TopologyURLQueyParams.IdSelected}=${id}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {tabSelected === Labels.Overview && <Overview site={site} />}
          {tabSelected === Labels.Details && <Details site={site} />}
          {tabSelected === Labels.RouterLinks && <Links site={site} />}
          {tabSelected === Labels.Pairs && <PairsList site={site} />}
          {tabSelected === Labels.Processes && <ProcessList site={site} />}
        </>
      }
    />
  );
};

const Site = function () {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || Labels.Overview;

  const { id: paramId } = useParams();
  const { id } = getIdAndNameFromUrlParams(paramId as string);

  return <SiteContent defaultTab={type} id={id} />;
};

export default Site;
