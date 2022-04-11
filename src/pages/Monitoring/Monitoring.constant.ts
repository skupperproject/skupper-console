import { LinksColumns, RoutersColumns, ServicesColumns } from './Monitoring.enum';

export const MAX_WIDTH_DETAILS_TABLE = 600;
export const MAX_HEIGHT_DETAILS_TABLE = 305;

export const ROUTERS_STATS_HEADER = [
  { property: 'name', name: RoutersColumns.Name },
  { property: 'totalBytes', name: RoutersColumns.TotalBytes },
  { property: 'totalVanAddress', name: RoutersColumns.NumServices },
  { property: 'totalFlows', name: RoutersColumns.NumFLows },
];

export const LINKS_STATS_HEADER = [
  { property: 'routerNameStart', name: LinksColumns.RouterStart },
  { property: 'routerNameEnd', name: LinksColumns.RouterEnd },
  { property: 'cost', name: LinksColumns.Cost },
  { property: 'mode', name: LinksColumns.Mode },
  { property: 'direction', name: LinksColumns.Direction },
];

export const VANS_STATS_HEADER = [
  { property: 'name', name: ServicesColumns.Name },
  { property: 'routersAssociated', name: ServicesColumns.RoutersAssociated },
  { property: 'totalBytes', name: ServicesColumns.TotalBytes },
  { property: 'totalDevices', name: ServicesColumns.NumDevices },
  { property: 'totalFlows', name: ServicesColumns.NumFLows },
];
