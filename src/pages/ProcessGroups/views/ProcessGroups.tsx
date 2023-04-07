import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import LoadingPage from '@pages/shared/Loading';
import { ProcessGroupResponse } from 'API/REST.interfaces';

import { processGroupsColumns } from '../ProcessGroups.constant';
import { ProcessGroupsLabels, ProcessGroupsRoutesPaths } from '../ProcessGroups.enum';
import { QueriesProcessGroups } from '../services/services.enum';

const initProcessGroupsQueryParams = {
  filter: 'processGroupRole.external'
};

const ProcessGroups = function () {
  const { data: processGroups, isLoading } = useQuery(
    [QueriesProcessGroups.GetProcessGroups, initProcessGroupsQueryParams],
    () => RESTApi.fetchProcessGroups(initProcessGroupsQueryParams)
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!processGroups) {
    return null;
  }

  return (
    <TransitionPage>
      <>
        <SkTitle title={ProcessGroupsLabels.Section} description={ProcessGroupsLabels.Description} />
        <div>
          <SkTable
            columns={processGroupsColumns}
            rows={processGroups}
            components={{
              linkCell: (props: LinkCellProps<ProcessGroupResponse>) =>
                LinkCell({
                  ...props,
                  type: 'service',
                  link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.name}@${props.data.identity}`
                })
            }}
          />
        </div>
      </>
    </TransitionPage>
  );
};

export default ProcessGroups;
