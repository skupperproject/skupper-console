import { FC } from 'react';

import { DEFAULT_TABLE_PAGE_SIZE } from '@config/config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { ProcessResponse } from 'API/REST.interfaces';

import { ServerColumnsNames } from '../Addresses.enum';
import { ServerTableProps } from '../Addresses.interfaces';

const components = {
  nameLinkCellProcess: (props: LinkCellProps<ProcessResponse>) =>
    LinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.name}@${props.data.identity}`
    }),
  nameLinkCellProcessGroup: (props: LinkCellProps<ProcessResponse>) =>
    LinkCell({
      ...props,
      type: 'service',
      link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.groupName}@${props.data.groupIdentity}`
    }),
  nameLinkCellSite: (props: LinkCellProps<ProcessResponse>) =>
    LinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.parentName}@${props.data.parent}`
    })
};

const columns: SKColumn<ProcessResponse>[] = [
  {
    name: ServerColumnsNames.Process,
    prop: 'name' as keyof ProcessResponse,
    component: 'nameLinkCellProcess',
    width: 20
  },
  {
    name: ServerColumnsNames.ProcessGroup,
    prop: 'groupName' as keyof ProcessResponse,
    component: 'nameLinkCellProcessGroup'
  },
  {
    name: ServerColumnsNames.Site,
    prop: 'parentName' as keyof ProcessResponse,
    component: 'nameLinkCellSite'
  },
  {
    name: ServerColumnsNames.Host,
    prop: 'sourceHost' as keyof ProcessResponse
  }
];

const ServersTable: FC<ServerTableProps> = function ({ processes }) {
  return <SkTable columns={columns} rows={processes} pageSizeStart={DEFAULT_TABLE_PAGE_SIZE} components={components} />;
};

export default ServersTable;
