import { AvailableProtocols } from '@API/REST.enum';

import { QueryFilters } from './REST.interfaces';

export interface QueryFiltersProtocolMap {
  [AvailableProtocols.Http]: QueryFilters;
  [AvailableProtocols.Http2]: QueryFilters;
  [AvailableProtocols.Tcp]: {
    active: QueryFilters;
    old: QueryFilters;
  };
}
