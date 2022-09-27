import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { ProcessesRoutesPaths } from '../Processes.enum';
import { ProcessesNameLinkCellProps } from '../Processes.interfaces';

const ProcessesNameLinkCell: FC<ProcessesNameLinkCellProps> = function ({ data, value }) {
    return (
        <>
            <ResourceIcon type="process" />
            <Link to={`${ProcessesRoutesPaths.Processes}/${data.identity}`}>{value}</Link>
        </>
    );
};
export default ProcessesNameLinkCell;
