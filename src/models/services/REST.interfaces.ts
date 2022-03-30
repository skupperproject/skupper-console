import { DataResponse, DataServicesResponse, ServiceConnections } from '../API/REST.interfaces';

export interface DataServices extends DataServicesResponse {
  derived?: boolean;
  isExternal?: boolean;
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

interface Deployments {
  key: string;
  service: any;
  site: any;
}

export interface DataVAN extends DataResponse {
  deployments: Deployments;
  deploymentLinks: DeploymentLinks[];
}
