import { GatewayColumns } from './GatewayTable.enum';

export const GATEWAYS_HEADER_TABLE = [
  { property: 'siteName', name: GatewayColumns.Name },
  { property: 'version', name: GatewayColumns.Version },
  { property: 'namespace', name: GatewayColumns.Namespace },
  { property: 'type', name: GatewayColumns.Type },
];
