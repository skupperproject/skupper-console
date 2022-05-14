import { RESTApi } from 'API/REST';
import { ServiceConnections } from 'API/REST.interfaces';

import { Deployment, DeploymentDetails, ServiceRequestReceived } from './deployments.interfaces';

const DeploymentsServices = {
    fetchDeployments: async (): Promise<Deployment[]> => RESTApi.fetchDeployments(),
    fetchDeployment: async (id: string | undefined): Promise<DeploymentDetails> => {
        const deployments = await RESTApi.fetchDeployments();

        const tcpConnectionsOut = getTCPConnectionsOutByService(deployments, id || '');
        const tcpConnectionsIn = getTCPConnectionsInByService(deployments, id || '');
        const httpConnectionsOut = getHTTPconnectionsOutByService(deployments, id || '');
        const httpConnectionsIn = getHTTPconnectionsInByService(deployments, id || '');
        const info = deployments.find(({ key }) => key === id) as Deployment;

        return {
            ...info,
            tcpConnectionsIn,
            tcpConnectionsOut,
            httpConnectionsOut,
            httpConnectionsIn,
        };
    },
};

export default DeploymentsServices;

function getHTTPconnectionsInByService(deployments: Deployment[], id: string) {
    const serviceName = id?.split('_')[0];

    return deployments
        .filter(({ service }) => !!service.requests_received && service.address === serviceName)
        .flatMap(
            ({ service: { requests_received } }) => requests_received as ServiceRequestReceived[],
        )
        .map(({ by_client }) => {
            const clients = Object.keys(by_client);
            const shorts = clients.map((client) => removeSuffixFromClientPropValue(client));

            return { ...Object.values(by_client)[0], client: shorts[0] };
        })
        .filter(Boolean) as ServiceConnections[];
}

function getHTTPconnectionsOutByService(deployments: Deployment[], id: string) {
    const serviceName = id?.split('_')[0];

    return deployments
        .filter(({ service }) => !!service.requests_received)
        .flatMap(
            ({ service: { requests_received, address } }) =>
                requests_received?.map((request) => ({
                    ...request,
                    address,
                })) as ServiceRequestReceived[],
        )
        .map(({ by_client, address }) => {
            const clients = Object.keys(by_client);
            const shorts = clients.map((client) => removeSuffixFromClientPropValue(client));
            const index = shorts.indexOf(removeSuffixFromClientPropValue(serviceName));
            if (index >= 0) {
                return { ...by_client[clients[index]], client: address };
            }
        })
        .filter(Boolean) as ServiceConnections[];
}

function getTCPConnectionsOutByService(deployments: Deployment[], id: string) {
    const otherDeployments = deployments.filter(({ key }) => key !== id) as Deployment[];
    const serviceName = id?.split('_')[0];

    return otherDeployments.flatMap(
        ({ service: { address, connections_ingress }, site: { site_name } }) =>
            (connections_ingress || [])
                .flatMap((connectionIn) => Object.values(connectionIn.connections))
                .filter(({ client }) => client.includes(serviceName))
                .flatMap((connection) => ({
                    ...connection,
                    client: `${site_name}/${address}`,
                })),
    );
}

function getTCPConnectionsInByService(deployments: Deployment[], id: string) {
    const myDeployments = deployments.filter(({ key }) => key === id) as Deployment[];

    return myDeployments.flatMap(({ service: { connections_ingress }, site: { site_name } }) =>
        (connections_ingress || [])
            .flatMap((connectionIn) => Object.values(connectionIn.connections))
            .flatMap((connection) => ({
                ...connection,
                client: removeSuffixFromClientPropValue(`${site_name}/${connection.client}`),
            })),
    );
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
