import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { AddressesRoutesPaths } from '@pages/Addresses/Addresses.enum';

import { AddressNameLinkCellProps } from '../Processes.interfaces';

const AddressNameLinkCell: FC<AddressNameLinkCellProps> = function ({ data, value }) {
    return (
        <>
            <ResourceIcon type="address" />
            <Link to={`${AddressesRoutesPaths.FlowsPairs}/${data.name}@${data.identity}`}>
                {value}
            </Link>
        </>
    );
};

export default AddressNameLinkCell;
