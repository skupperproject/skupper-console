import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SectionTitle from '@core/components/SectionTitle';
import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { ProcessGroupResponse } from 'API/REST.interfaces';

import { processGroupsColumns } from '../ProcessGroups.constant';
import { ProcessGroupsLabels, ProcessGroupsRoutesPaths } from '../ProcessGroups.enum';
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
      <>
        <SectionTitle title={ProcessGroupsLabels.Section} description={ProcessGroupsLabels.Description} />
        <div>
          <SkTable
            columns={processGroupsColumns}
            rows={processGroups}
            components={{
              linkCell: (props: LinkCellProps<ProcessGroupResponse>) =>
                LinkCell({
                  ...props,
                  type: 'service',
                  link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.identity}`
                })
            }}
          />
        </div>
      </>
    </TransitionPage>
  );
};

export default ProcessGroups;
