import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';
import { AddressResponse } from 'API/REST.interfaces';

import { AddressesColumns, AddressesLabels } from '../Addresses.enum';
import { AddressesTableProps } from '../Addresses.interfaces';
import AddressNameLinkCell from './AddressNameLinkCell';

const AddressesTable: FC<AddressesTableProps> = function ({ addresses }) {
    const columns = [
        {
            name: AddressesColumns.Name,
            prop: 'name' as keyof AddressResponse,
            component: 'linkCell',
        },
        {
            name: AddressesColumns.TotalFlowPairs,
            prop: 'totalFlows' as keyof AddressResponse,
        },
        {
            name: AddressesColumns.CurrentFlowPairs,
            prop: 'currentFlows' as keyof AddressResponse,
        },
        {
            name: AddressesColumns.TotalConnectors,
            prop: 'connectorCount' as keyof AddressResponse,
        },
    ];

    return (
        <SkTable
            title={AddressesLabels.Section}
            titleDescription={AddressesLabels.Description}
            columns={columns}
            rows={addresses}
            components={{ linkCell: AddressNameLinkCell }}
        />
    );
};

export default AddressesTable;
