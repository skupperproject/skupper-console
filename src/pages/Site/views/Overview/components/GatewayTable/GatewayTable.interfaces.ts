import { SiteData } from '@pages/Site/services/services.interfaces';

export interface GatewaysTableProps {
  siteId: string;
  gateways: SiteData[];
}
