import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';
import { formatByteRate } from '@core/utils/formatBytes';

import { FlowPairsColumnsNames } from '../Addresses.enum';
import { FlowPairBasic, FlowPairsTableProps } from '../services/services.interfaces';
import ProcessNameLinkCell from './ProcessNameLinkCell';
import SiteNameLinkCell from './SiteNameLinkCell';

const FlowsPairsTable: FC<FlowPairsTableProps> = function ({ flowPairs }) {
    const columns = [
        {
            name: FlowPairsColumnsNames.Client,
            prop: 'processName' as keyof FlowPairBasic,
            component: 'ProcessNameLinkCell',
        },
        {
            name: FlowPairsColumnsNames.Port,
            prop: 'port' as keyof FlowPairBasic,
        },
        {
            name: FlowPairsColumnsNames.Site,
            prop: 'siteName' as keyof FlowPairBasic,
            component: 'SiteNameLinkCell',
        },
        {
            name: FlowPairsColumnsNames.ByteRateTX,
            prop: 'byteRate' as keyof FlowPairBasic,
            format: formatByteRate,
        },
        {
            name: FlowPairsColumnsNames.ByteRateRX,
            prop: 'targetByteRate' as keyof FlowPairBasic,
            format: formatByteRate,
        },
        {
            name: FlowPairsColumnsNames.Server,
            prop: 'targetProcessName' as keyof FlowPairBasic,
            component: 'ProcessNameLinkCell',
        },
        {
            name: FlowPairsColumnsNames.ServerSite,
            prop: 'targetSiteName' as keyof FlowPairBasic,
            component: 'SiteNameLinkCell',
        },
    ];

    return (
        <SkTable
            columns={columns}
            rows={flowPairs}
            components={{ ProcessNameLinkCell, SiteNameLinkCell }}
        />
    );
};

export default FlowsPairsTable;
