import React from 'react';

import { useParams } from 'react-router-dom';

import TransitionPage from '@core/components/TransitionPages/Slide';
import { AvailableProtocols } from 'API/REST.enum';

import ConnectionsByAddress from '../components/ConnectionsByAddress';
import RequestsByAddress from '../components/RequestsByAddress';

const FlowsPairs = function () {
  const { address } = useParams();

  const addressName = address?.split('@')[0];
  const addressId = address?.split('@')[1];
  const protocol = address?.split('@')[2];

  return (
    <TransitionPage>
      <>
        {protocol === AvailableProtocols.Tcp && (
          <ConnectionsByAddress addressName={addressName || ''} addressId={addressId || ''} protocol={protocol} />
        )}
        {(protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2) && (
          <RequestsByAddress addressName={addressName || ''} addressId={addressId || ''} protocol={protocol} />
        )}
      </>
    </TransitionPage>
  );
};
export default FlowsPairs;
