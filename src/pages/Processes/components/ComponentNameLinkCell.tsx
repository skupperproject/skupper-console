import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';

import { SiteNameLinkCellProps } from '../Processes.interfaces';

const ComponentNameLinkCell: FC<SiteNameLinkCellProps> = function ({ data, value }) {
  return (
    <>
      <ResourceIcon type="service" />
      <Link to={`${ProcessGroupsRoutesPaths.ProcessGroups}/${data.groupIdentity}`}>{value}</Link>
    </>
  );
};

export default ComponentNameLinkCell;
