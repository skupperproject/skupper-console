import { RESTApi } from 'API/REST';
import { DeploymentTopologyResponse } from 'API/REST.interfaces';

import {
    Deployment,
    DeploymentDetails,
    ServiceRequestReceived,
    DeploymentSite,
    DeploymentTraffic,
} from './deployments.interfaces';

const DeploymentsServices = {
    fetchDeployments: async (): Promise<Deployment[]> => RESTApi.fetchDeployments(),
    fetchDeployment: async (id: string | undefined): Promise<DeploymentDetails> => {
        const deployments = await RESTApi.fetchDeployments();

        const info = deployments.find(({ key }) => key === id) as Deployment;

        const tcpConnectionsOut = getTCPConnectionsOutBysSite(deployments, id || '');
        const tcpConnectionsIn = getTCPConnectionsInBySite(deployments, id || '');
        const httpRequestsSent = getHTTPconnectionsOutByService(deployments, id || '');
        const httpRequestsReceived = getHTTPconnectionsInByService(deployments, id || '');

        const tcpConnectionsOutGrouped = Object.values(groupTrafficServices(tcpConnectionsOut));
        const tcpConnectionsInGrouped = Object.values(groupTrafficServices(tcpConnectionsIn));
        const httpConnectionsSentGrouped = Object.values(groupTrafficServices(httpRequestsSent));
        const httpConnectionsReceivedGrouped = Object.values(
            groupTrafficServices(httpRequestsReceived),
        );

        return {
            ...info,
            tcpConnectionsOut: tcpConnectionsOutGrouped,
            tcpConnectionsIn: tcpConnectionsInGrouped,
            httpRequestsSent: httpConnectionsSentGrouped,
            httpRequestsReceived: httpConnectionsReceivedGrouped,
        };
    },
};

export default DeploymentsServices;

function groupTrafficServices(trafficServices: DeploymentTraffic[]) {
    return trafficServices.reduce((acc, { bytes_in, bytes_out, ...rest }) => {
        acc[rest.client] = {
            ...rest,
            bytes_in: (acc[rest.client]?.bytes_in || 0) + bytes_in,
            bytes_out: (acc[rest.client]?.bytes_out || 0) + bytes_out,
        };

        return acc;
    }, {} as Record<string, DeploymentTraffic>);
}

function getHTTPconnectionsInByService(deployments: Deployment[], id: string) {
    const serviceName = id?.split('_')[0];

    const sitesMap = deployments.reduce((acc, { site }) => {
        acc[site.site_id] = site;

        return acc;
    }, {} as Record<string, DeploymentSite>);

    return deployments
        .filter(({ service }) => !!service.requests_received && service.address === serviceName)
        .flatMap(
            ({ service: { requests_received } }) => requests_received as ServiceRequestReceived[],
        )
        .flatMap(({ by_client, site_id }) => {
            const clients = Object.keys(by_client);
            const shorts = clients.map((client) => removeSuffixFromClientPropValue(client));

            const site = sitesMap[site_id];

            return clients.flatMap((client, index) => ({
                ...by_client[client],
                client: `${site.site_name}/${shorts[index]}`,
                site,
            }));
        })
        .filter(Boolean) as DeploymentTraffic[];
}

function getHTTPconnectionsOutByService(deployments: Deployment[], id: string) {
    const serviceName = id?.split('_')[0];

    return deployments
        .filter(({ service }) => !!service.requests_received)
        .flatMap(
            ({ service: { requests_received, address }, site }) =>
                requests_received?.map((request) => ({
                    ...request,
                    site,
                    address,
                })) as ServiceRequestReceived[],
        )
        .map(({ by_client, address, site }) => {
            const clients = Object.keys(by_client);
            const shorts = clients.map((client) => removeSuffixFromClientPropValue(client));
            const index = shorts.indexOf(removeSuffixFromClientPropValue(serviceName));

            if (index >= 0) {
                return {
                    ...by_client[clients[index]],
                    client: `${site.site_name}/${address}`,
                    site,
                };
            }
        })
        .filter(Boolean) as DeploymentTraffic[];
}

function getTCPConnectionsOutBysSite(deployments: Deployment[], id: string) {
    const otherDeployments = deployments.filter(({ key }) => key !== id) as Deployment[];
    const serviceName = id?.split('_')[0];

    return otherDeployments.flatMap(({ service: { address, connections_ingress }, site }) =>
        (connections_ingress || [])
            .flatMap((connectionIn) => Object.values(connectionIn.connections))
            .filter(({ client }) => client.includes(serviceName))
            .flatMap((connection) => ({
                ...connection,
                client: `${site.site_name}/${address}`,
                site,
            })),
    );
}

function getTCPConnectionsInBySite(deployments: Deployment[], id: string) {
    const myDeployments = deployments.find(({ key }) => key === id);
    const otherDeployments = deployments.filter(({ key }) => key !== id);

    return (myDeployments?.service.connections_ingress || [])
        .flatMap((connectionIn) => Object.values(connectionIn.connections))
        .filter(({ client }) => !client.includes(myDeployments?.service.address || '')) //remove himself
        .flatMap((connection) => {
            const siteIdTarget = connection.id.split('@')[1];
            const deploymentTarget = otherDeployments.find(
                ({ site: { site_id } }) => site_id === siteIdTarget,
            ) as DeploymentTopologyResponse;

            return {
                ...connection,
                client: removeSuffixFromClientPropValue(
                    `${deploymentTarget?.site.site_name}/${connection.client}`,
                ),
                site: deploymentTarget.site,
            };
        });
}

function removeSuffixFromClientPropValue(name: string) {
    const parts = name.split('-');
    if (parts.length > 2) {
        const len = parts.length;
        if (
            parts[len - 1].length === 5 &&
            (parts[len - 2].length === 10 || parts[len - 2].length === 9)
        ) {
            parts.splice(len - 2, 2);

            return parts.join('-');
        }
    }

    return name;
}
