import React from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Title
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import ProcessesTable from '@pages/Processes/components/ProcessesTable';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { isPrometheusActive } from 'API/Prometheus.constant';

import { ProcessGroupsLabels } from '../ProcessGroups.enum';
import { QueriesProcessGroups } from '../services/services.enum';

const initProcessesQueryParams = {
  filter: 'endTime.0'
};

const ProcessGroup = function () {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const { id: processGroupId } = getIdAndNameFromUrlParams(id);

  const { data: processGroup, isLoading: isLoadingProcessGroup } = useQuery(
    [QueriesProcessGroups.GetProcessGroup, processGroupId],
    () => RESTApi.fetchProcessGroup(processGroupId),
    {
      onError: handleError
    }
  );

  const { data: processes, isLoading: isLoadingProcess } = useQuery(
    [QueriesProcessGroups.GetProcessesByProcessGroup, processGroupId, initProcessesQueryParams],
    () => RESTApi.fetchProcessesByProcessGroup(processGroupId, initProcessesQueryParams),
    {
      onError: handleError
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

  if (isLoadingProcessGroup || isLoadingProcess) {
    return <LoadingPage />;
  }

  if (!processGroup || !processes) {
    return null;
  }

  const { name } = processGroup;

  const serverNameFilters = Object.values(processes).map(({ name: destinationName }) => ({ destinationName }));
  const serverNames = processes.map(({ name: processName }) => processName).join('|');
  const startTime = processes.reduce((acc, process) => Math.max(acc, process.startTime), 0);

  return (
    <TransitionPage>
      <Grid hasGutter>
        <SkTitle
          title={name}
          icon="service"
          link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.ProcessGroups}&${TopologyURLFilters.IdSelected}=${processGroupId}`}
        />

        {/* Component description*/}
        <GridItem span={12}>
          <Card isFullHeight isRounded>
            <CardTitle>
              <Title headingLevel="h2">{ProcessGroupsLabels.Details}</Title>
            </CardTitle>
            <CardBody>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{ProcessGroupsLabels.Name}</DescriptionListTerm>
                  <DescriptionListDescription>{name}</DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </GridItem>

        {/* Processes table*/}
        <GridItem span={12}>
          <ProcessesTable processes={processes} />
        </GridItem>

        {/* Component Metrics*/}
        {isPrometheusActive() && (
          <GridItem>
            <Metrics
              parent={{ id: serverNames, name: serverNames, startTime }}
              sourceProcesses={serverNameFilters}
              customFilters={{
                destinationProcesses: { disabled: true, name: MetricsLabels.FilterAllDestinationProcesses },
                sourceProcesses: { name: MetricsLabels.FilterAllSourceProcesses }
              }}
            />
          </GridItem>
        )}
      </Grid>
    </TransitionPage>
  );
};

export default ProcessGroup;
