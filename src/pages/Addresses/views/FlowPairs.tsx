import { useParams } from 'react-router-dom';

import { AvailableProtocols } from '@API/REST.enum';
import TransitionPage from '@core/components/TransitionPages/Fade';

import ConnectionsByAddress from '../components/ConnectionsByAddress';
import RequestsByAddress from '../components/RequestsByAddress';

const FlowsPairs = function () {
  const { service } = useParams();

  const addressName = service?.split('@')[0];
  const addressId = service?.split('@')[1];
  const protocol = service?.split('@')[2];

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
