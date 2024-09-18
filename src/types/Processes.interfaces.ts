import { Protocols } from '@API/REST.enum';

import { QueryFilters } from './REST.interfaces';

export interface QueryFiltersProtocolMap {
  [Protocols.Http]: QueryFilters;
  [Protocols.Http2]: QueryFilters;
  [Protocols.Tcp]: {
    active: QueryFilters;
    old: QueryFilters;
  };
}
