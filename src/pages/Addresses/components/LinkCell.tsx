import React from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { LinkCellProps } from '../Addresses.interfaces';

const LinkCell = function <T>({ value, link, type }: LinkCellProps<T>) {
    return (
        <>
            {type && <ResourceIcon type={type} />}
            <Link to={link}>{value}</Link>
        </>
    );
};

export default LinkCell;
