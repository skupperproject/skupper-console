import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ProcessResponse } from 'API/REST.interfaces';

import { ProcessGroupsRoutesPaths } from '../ProcessGroups.enum';

export interface ProcessGroupNameLinkCellProps {
    data: ProcessResponse;
    value: ProcessResponse[keyof ProcessResponse];
}

const ProcessGroupNameLinkCell: FC<ProcessGroupNameLinkCellProps> = function ({ data, value }) {
    return (
        <>
            <ResourceIcon type="service" />
            <Link to={`${ProcessGroupsRoutesPaths.ProcessGroups}/${data.identity}`}>{value}</Link>
        </>
    );
};
export default ProcessGroupNameLinkCell;
