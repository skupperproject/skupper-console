import { AvailableProtocols } from '@API/REST.enum';

import { RemoteFilterOptions } from './REST.interfaces';

export interface RemoteFilterOptionsProtocolMap {
  [AvailableProtocols.Http]: RemoteFilterOptions;
  [AvailableProtocols.Http2]: RemoteFilterOptions;
  [AvailableProtocols.Tcp]: {
    active: RemoteFilterOptions;
    old: RemoteFilterOptions;
  };
}
