import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';
import { AddressResponse } from 'API/REST.interfaces';

import { AddressesColumns, AddressesLabels, AddressesRoutesPaths } from '../Addresses.enum';
import { AddressesTableProps, LinkCellProps } from '../Addresses.interfaces';
import LinkCell from './LinkCell';

const AddressesTable: FC<AddressesTableProps> = function ({ addresses }) {
    const columns = [
        {
            name: AddressesColumns.Name,
            prop: 'name' as keyof AddressResponse,
            component: 'AddressNameLinkCell',
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
            components={{
                AddressNameLinkCell: (props: LinkCellProps<AddressResponse>) =>
                    LinkCell({
                        ...props,
                        type: 'address',
                        link: `${AddressesRoutesPaths.Addresses}/${props.data.name}@${props.data.identity}`,
                    }),
            }}
        />
    );
};

export default AddressesTable;
