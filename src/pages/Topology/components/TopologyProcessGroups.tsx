import React, { FC, useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { QueriesProcessGroups } from '@pages/ProcessGroups/services/services.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import GraphReactAdaptor from '../../../core/components/Graph/GraphReactAdaptor';
import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';

const processGroupsQueryParams = {
  filter: 'processGroupRole.external'
};

const TopologyProcessGroups: FC<{ id?: string }> = function ({ id }) {
  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
  const [nodeSelected] = useState<string | undefined>(id);

  const { data: processGroups, isLoading: isLoadingProcessGroups } = useQuery(
    [QueriesProcessGroups.GetProcessGroups, processGroupsQueryParams],
    () => RESTApi.fetchProcessGroups(processGroupsQueryParams),
    {
      refetchInterval,
      onError: handleError
    }
  );

  const { data: processGroupsPairs, isLoading: isLoadingProcessGroupsPairs } = useQuery(
    [QueriesTopology.GetProcessGroupsLinks],
    () => RESTApi.fetchProcessgroupsPairs(),
    {
      refetchInterval,
      onError: handleError
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  const handleGetSelectedNode = useCallback(
    ({ id: idSelected, name }: { id: string; name: string }) => {
      navigate(`${ProcessGroupsRoutesPaths.ProcessGroups}/${name}@${idSelected}`);
    },
    [navigate]
  );

  if (isLoadingProcessGroups || isLoadingProcessGroupsPairs) {
    return <LoadingPage />;
  }

  if (!processGroups || !processGroupsPairs) {
    return null;
  }

  const links = TopologyController.getProcessGroupsLinks(processGroupsPairs);
  const nodes = TopologyController.getNodesFromSitesOrProcessGroups(processGroups);

  return (
    <GraphReactAdaptor nodes={nodes} edges={links} onClickNode={handleGetSelectedNode} nodeSelected={nodeSelected} />
  );
};

export default TopologyProcessGroups;
