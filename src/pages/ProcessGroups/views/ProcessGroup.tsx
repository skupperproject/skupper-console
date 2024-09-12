import { useState, MouseEvent as ReactMouseEvent } from 'react';

import { Badge, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { getTestsIds } from '@config/testIds';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import Overview from '../components/Overview.';
import ProcessList from '../components/ProcessList';
import { ComponentLabels, QueriesComponent } from '../ProcessGroups.enum';

const ProcessGroup = function () {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || ComponentLabels.Overview;

  const { id } = useParams() as { id: string };
  const { id: processGroupId } = getIdAndNameFromUrlParams(id);
  const [tabSelected, setTabSelected] = useState(type);

  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected, true);

  const [{ data: processes }, { data: component }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesComponent.GetProcessesByProcessGroup, { groupIdentity: processGroupId }],
        queryFn: () => RESTApi.fetchProcessesResult({ endTime: 0, groupIdentity: processGroupId })
      },
      {
        queryKey: [QueriesComponent.GetProcessGroup, processGroupId],
        queryFn: () => RESTApi.fetchProcessGroup(processGroupId)
      }
    ]
  });

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as ComponentLabels);
  }

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={ComponentLabels.Overview} title={<TabTitleText>{ComponentLabels.Overview}</TabTitleText>} />
        <Tab
          eventKey={ComponentLabels.Processes}
          title={
            <TabTitleText>
              {ComponentLabels.Processes}{' '}
              {!!component.processCount && (
                <Badge isRead key={1}>
                  {component.processCount}
                </Badge>
              )}
            </TabTitleText>
          }
        />
      </Tabs>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.componentView(processGroupId)}
      title={component.name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Components}&${TopologyURLQueyParams.IdSelected}=${processGroupId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {tabSelected === ComponentLabels.Overview && <Overview component={component} processes={processes} />}
          {tabSelected === ComponentLabels.Processes && <ProcessList processes={processes} />}
        </>
      }
    />
  );
};

export default ProcessGroup;
