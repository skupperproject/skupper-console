import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { AddressesRoutesPaths } from '../Addresses.enum';
import { AddressNameLinkCellProps } from '../Addresses.interfaces';

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
