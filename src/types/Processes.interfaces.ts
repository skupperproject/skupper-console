import { QueryFilters } from './REST.interfaces';
import { Protocols } from '../API/REST.enum';

export interface QueryFiltersProtocolMap {
  [Protocols.Http]: QueryFilters;
  [Protocols.Http2]: QueryFilters;
  [Protocols.Tcp]: {
    active: QueryFilters;
    old: QueryFilters;
  };
}
