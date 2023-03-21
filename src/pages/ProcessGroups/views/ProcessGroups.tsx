import React from 'react';

import { Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';

import ProcessGroupNameLinkCell from '../components/ProcessGroupNameLinkCell';
import { processGroupsColumns } from '../ProcessGroups.constant';
import { ProcessGroupsLabels } from '../ProcessGroups.enum';
import { QueriesProcessGroups } from '../services/services.enum';

const initProcessGroupsQueryParams = {
  filter: 'processGroupRole.external'
};

const ProcessGroups = function () {
  const navigate = useNavigate();

  const { data: processGroups, isLoading } = useQuery(
    [QueriesProcessGroups.GetProcessGroups, initProcessGroupsQueryParams],
    () => RESTApi.fetchProcessGroups(initProcessGroupsQueryParams),
    {
      onError: handleError
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!processGroups) {
    return null;
  }

  return (
    <TransitionPage>
      <Grid hasGutter>
        <GridItem span={12}>
          <SkTable
            title={ProcessGroupsLabels.Section}
            titleDescription={ProcessGroupsLabels.Description}
            columns={processGroupsColumns}
            rows={processGroups}
            components={{ linkCell: ProcessGroupNameLinkCell }}
          />
        </GridItem>
      </Grid>
    </TransitionPage>
  );
};

export default ProcessGroups;
