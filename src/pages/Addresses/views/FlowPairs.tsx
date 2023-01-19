import React from 'react';

import { useParams } from 'react-router-dom';

import { AvailableProtocols } from 'API/REST.enum';

import ConnectionsByAddress from '../components/ConnectionsByAddress';
import RequestsByAddress from '../components/RequestsByAddress';

const FlowsPairs = function () {
    const { address } = useParams();

    const addressName = address?.split('@')[0];
    const addressId = address?.split('@')[1];
    const protocol = address?.split('@')[2];

    return protocol === AvailableProtocols.Tcp ? (
        <ConnectionsByAddress addressName={addressName || ''} addressId={addressId || ''} />
    ) : (
        <RequestsByAddress addressName={addressName || ''} addressId={addressId || ''} />
    );
};
export default FlowsPairs;
