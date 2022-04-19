import { SiteInfo } from '@pages/Sites/services/services.interfaces';

export interface GatewaysTableProps {
    siteId: string;
    gateways: SiteInfo[];
}
