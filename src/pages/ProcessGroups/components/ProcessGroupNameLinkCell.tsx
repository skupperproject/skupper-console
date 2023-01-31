import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { ProcessGroupsRoutesPaths } from '../ProcessGroups.enum';
import { ProcessGroupNameLinkCellProps } from '../ProcessGroups.interfaces';

const ProcessGroupNameLinkCell: FC<ProcessGroupNameLinkCellProps> = function ({ data, value }) {
    return (
        <>
            <ResourceIcon
                type={
                    !data.processGroupRole || data.processGroupRole === 'external'
                        ? 'service'
                        : 'skupper'
                }
            />
            <Link to={`${ProcessGroupsRoutesPaths.ProcessGroups}/${data.identity}`}>{value}</Link>
        </>
    );
};
export default ProcessGroupNameLinkCell;
