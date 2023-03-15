import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { SitesRoutesPaths } from '../../Sites/Sites.enum';
import { SiteNameLinkCellProps } from '../Processes.interfaces';

const SiteNameLinkCell: FC<SiteNameLinkCellProps> = function ({ data, value }) {
  return (
    <>
      <ResourceIcon type="site" />
      <Link to={`${SitesRoutesPaths.Sites}/${data.parent}`}>{value}</Link>
    </>
  );
};

export default SiteNameLinkCell;
