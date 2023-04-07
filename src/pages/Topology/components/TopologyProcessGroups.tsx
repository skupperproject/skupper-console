import React, { FC, useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import { UPDATE_INTERVAL } from '@config/config';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { QueriesProcessGroups } from '@pages/ProcessGroups/services/services.enum';
import LoadingPage from '@pages/shared/Loading';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';

const processGroupsQueryParams = {
  filter: 'processGroupRole.external'
};

const TopologyProcessGroups: FC<{ id?: string }> = function ({ id }) {
  const navigate = useNavigate();
  const [nodeSelected] = useState<string | undefined>(id);

  const { data: processGroups, isLoading: isLoadingProcessGroups } = useQuery(
    [QueriesProcessGroups.GetProcessGroups, processGroupsQueryParams],
    () => RESTApi.fetchProcessGroups(processGroupsQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: processGroupsPairs, isLoading: isLoadingProcessGroupsPairs } = useQuery(
    [QueriesTopology.GetProcessGroupsLinks],
    () => RESTApi.fetchProcessgroupsPairs(),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

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
