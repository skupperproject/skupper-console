import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { ProcessesRoutesPaths } from '../Processes.enum';
import { ProcessNameLinkCellProps } from '../Processes.interfaces';

const ProcessNameLinkCell: FC<ProcessNameLinkCellProps> = function ({ data, value }) {
    return (
        <>
            <ResourceIcon
                type={!data.processRole || data.processRole === 'external' ? 'process' : 'skupper'}
            />
            <Link to={`${ProcessesRoutesPaths.Processes}/${data.identity}`}>{value}</Link>
        </>
    );
};

export default ProcessNameLinkCell;
