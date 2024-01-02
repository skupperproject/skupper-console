import { useState, MouseEvent as ReactMouseEvent } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { getTestsIds } from '@config/testIds';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';

import Details from '../components/Details';
import Overview from '../components/Overview.';
import { SiteLabels, QueriesSites } from '../Sites.enum';

const Site = function () {
  const { id } = useParams() as { id: string };
  const [searchParams, setSearchParams] = useSearchParams();

  const { id: siteId } = getIdAndNameFromUrlParams(id);
  const type = searchParams.get('type') || SiteLabels.Overview;

  const { data: site } = useSuspenseQuery({
    queryKey: [QueriesSites.GetSite, siteId],
    queryFn: () => RESTApi.fetchSite(siteId)
  });

  const [tabSelected, setTabSelected] = useState(type);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as SiteLabels);
    setSearchParams({ type: tabIndex as string });
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
      dataTestId={getTestsIds.siteView(siteId)}
      title={site.name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Sites}&${TopologyURLQueyParams.IdSelected}=${siteId}`}
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

export default Site;
