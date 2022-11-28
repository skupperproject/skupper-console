import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import { ProcessNameLinkCellProps } from '../Addresses.interfaces';

const ProcessNameLinkCell: FC<ProcessNameLinkCellProps> = function ({ data, value }) {
    return (
        <>
            <ResourceIcon type="process" />
            <Link to={`${ProcessesRoutesPaths.Processes}/${data.id}`}>{value}</Link>
        </>
    );
};

export default ProcessNameLinkCell;
