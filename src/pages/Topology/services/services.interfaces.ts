import { DeploymentLinksResponse, DeploymentTopologyResponse } from 'API/REST.interfaces';

export type DeploymentNode = DeploymentTopologyResponse;

export type Deployments = {
    deployments: DeploymentNode[];
    deploymentLinks: DeploymentLinksResponse[];
};
