import {
  DataResponse,
  LinksResponse,
  ServicesResponse,
  ServiceConnections,
  DataServicesResponse,
  TokenResponse,
} from '../API/REST.interfaces';

export type DataServices = DataServicesResponse;

export type SiteInfoService =
  | ServicesResponse
  | {
      name: string;
      protocol?: string;
      ports?: {
        name: string;
        port: number;
      };
      endpoints?: [
        {
          name: string;
          target: string;
          ports: {
            [port: string]: number;
          };
        },
      ];
      exposed: boolean;
      type: string;
    };

export interface SiteInfo {
  siteId: string;
  siteName: string;
}

interface Deployments {
  key: string;
  service: any;
  site: any;
}

interface DeploymentLinksStreamPoints {
  site: { site_id: string; site_name: string };
}

export interface DeploymentLinks {
  key: string;
  request: ServiceConnections;
  source: DeploymentLinksStreamPoints;
  target: DeploymentLinksStreamPoints;
}
export interface DataVAN extends DataResponse {
  deployments: Deployments;
  deploymentLinks: DeploymentLinks[];
}

export type Tokens = TokenResponse;
export type Links = LinksResponse;
