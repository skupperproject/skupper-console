import { useState, MouseEvent as ReactMouseEvent, FC } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { getTestsIds } from '@config/testIds';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import Details from '../components/Details';
import Overview from '../components/Overview.';
import { SiteLabels, QueriesSites } from '../Sites.enum';

interface SiteProps {
  id: string;
  defaultTab: string;
}

const SiteContent: FC<SiteProps> = function ({ id, defaultTab }) {
  const { data: site } = useSuspenseQuery({
    queryKey: [QueriesSites.GetSite, id],
    queryFn: () => RESTApi.fetchSite(id)
  });

  const [tabSelected, setTabSelected] = useState(defaultTab);
  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected, true);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as SiteLabels);
  }

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={SiteLabels.Overview} title={<TabTitleText>{SiteLabels.Overview}</TabTitleText>} />
        <Tab eventKey={SiteLabels.Details} title={<TabTitleText>{SiteLabels.Details}</TabTitleText>} />
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
          {tabSelected === SiteLabels.Overview && <Overview site={site} />}
          {tabSelected === SiteLabels.Details && <Details site={site} />}
        </>
      }
    />
  );
};

const Site = function () {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || SiteLabels.Overview;

  const { id: paramId } = useParams();
  const { id } = getIdAndNameFromUrlParams(paramId as string);

  return <SiteContent defaultTab={type} id={id} />;
};

export default Site;
