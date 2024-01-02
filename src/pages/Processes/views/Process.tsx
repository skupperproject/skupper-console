import { useState, MouseEvent as ReactMouseEvent } from 'react';

import { Badge, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';

import Details from '../components/Details';
import Overview from '../components/Overview';
import ProcessPairs from '../components/ProcessesPairs';
import { ProcessesLabels, QueriesProcesses } from '../Processes.enum';

const Process = function () {
  const [searchParams, setSearchParams] = useSearchParams();

  const { id } = useParams() as { id: string };
  const { id: processId, name: processName } = getIdAndNameFromUrlParams(id);

  const type = searchParams.get('type') || ProcessesLabels.Overview;
  const [tabSelected, setTabSelected] = useState(type);

  const clientPairsQueryParams = {
    limit: 0,
    sourceId: processId
  };

  const serverPairsQueryParams = {
    limit: 0,
    destinationId: processId
  };

  const { data: process } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetProcess, processId],
    queryFn: () => RESTApi.fetchProcess(processId)
  });

  const { data: clientPairs } = useQuery({
    queryKey: [QueriesProcesses.GetProcessPairs, clientPairsQueryParams],
    queryFn: () => RESTApi.fetchProcessesPairs(clientPairsQueryParams),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: serverPairs } = useQuery({
    queryKey: [QueriesProcesses.GetProcessPairs, serverPairsQueryParams],
    queryFn: () => RESTApi.fetchProcessesPairs(serverPairsQueryParams),
    refetchInterval: UPDATE_INTERVAL
  });

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as ProcessesLabels);
    setSearchParams({ type: tabIndex as string });
  }

  const processesCount = (clientPairs?.timeRangeCount || 0) + (serverPairs?.timeRangeCount || 0);

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={ProcessesLabels.Overview} title={<TabTitleText>{ProcessesLabels.Overview}</TabTitleText>} />
        <Tab eventKey={ProcessesLabels.Details} title={<TabTitleText>{ProcessesLabels.Details}</TabTitleText>} />
        <Tab
          disabled={!processesCount}
          eventKey={ProcessesLabels.ProcessPairs}
          title={
            <TabTitleText>
              {ProcessesLabels.ProcessPairs}{' '}
              {!!processesCount && (
                <Badge isRead key={1}>
                  {processesCount}
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
      dataTestId={getTestsIds.processView(processId)}
      title={processName}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.IdSelected}=${processId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {tabSelected === ProcessesLabels.Overview && <Overview process={process} />}
          {tabSelected === ProcessesLabels.Details && <Details process={process} />}
          {tabSelected === ProcessesLabels.ProcessPairs && <ProcessPairs process={process} />}
        </>
      }
    />
  );
};

export default Process;
