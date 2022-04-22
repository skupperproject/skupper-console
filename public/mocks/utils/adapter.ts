/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable guard-for-in */
import { DataResponse } from 'API/REST.interfaces';

import { utils } from './utilities';

let INSTANCE = 0;
const SHOW_EXTERNAL = true;

class Adapter {
    data: any;
    instance: number;
    siteInfo: { name: any };
    constructor(data: DataResponse) {
        this.data = data;
        this.sortSites();
        this.sortServices();
        this.instance = ++INSTANCE;
        this.processGateways();
        this.decorateSiteNames();
        this.fixTargets();
        this.fixBinaryAddresses();
        this.fixConnections();
        this.removeEmptyServices();
        this.addSendersServices();
        this.addServicesToClusters();
        this.addServersToSites();
        //this.addSourcesTargets();
        this.sortServices();
        this.createDeployments();

        this.data.getDeploymentLinks = () => this.getDeploymentLinks(SHOW_EXTERNAL);
        this.siteInfo = { name: this.data.sites[0].site_name };
    }
    getData = () => this.data;

    processGateways = () => {
        this.data.sites.forEach((site: { gateway: any; parent_site: any; connected: any[] }) => {
            if (site.gateway) {
                try {
                    site.parent_site = this.findSite(site.connected[0]);
                } catch (e) {
                    console.log(`Error finding gateway parent site`);
                }
            }
        });
    };

    // if multiple sites have the same name,
    // append (#) to the site names
    decorateSiteNames = () => {
        this.data.sites.forEach((site: { site_name: any }, i: any) => {
            const sameNames = this.data.sites.filter(
                (s: { site_name: any; nameDecorated: any }) =>
                    s.site_name === site.site_name && !s.nameDecorated,
            );
            if (sameNames.length > 1) {
                sameNames.forEach((s: { nameDecorated: boolean; site_name: string }, i: number) => {
                    s.nameDecorated = true;
                    s.site_name = `${s.site_name} (${i + 1})`;
                });
            }
        });
    };

    // TODO: why do some services have non-ascii characters?
    fixBinaryAddresses = () => {
        this.data.services = this.data.services.filter(
            (service: { address: string }) => !utils.hasUnicode(service.address),
        );
    };

    // sometimes a tcp service will not have a connections_in/egress
    // rather than test for that in all the code here, we just set
    // any missing lists to []
    fixConnections = () => {
        this.data.services.forEach(
            (service: {
                protocol: string;
                connections_egress: never[];
                connections_ingress: never[];
            }) => {
                if (service.protocol === 'tcp') {
                    if (!service.connections_egress) {
                        service.connections_egress = [];
                    }
                    if (!service.connections_ingress) {
                        service.connections_ingress = [];
                    }
                }
            },
        );
    };

    sortSites = () => {
        this.data.sites.sort((a: { site_name: number }, b: { site_name: number }) =>
            a.site_name < b.site_name ? -1 : a.site_name > b.site_name ? 1 : 0,
        );
    };
    sortServices = () => {
        const bySiteId = [
            'requests_received',
            'requests_handled',
            'connections_ingress',
            'connections_egress',
        ];
        this.data.services.sort((a: { address: number }, b: { address: number }) =>
            a.address < b.address ? -1 : a.address > b.address ? 1 : 0,
        );
        this.data.services.forEach((service: { [x: string]: any[] }) => {
            bySiteId.forEach((attr) => {
                if (service[attr]) {
                    service[attr].sort((a, b) =>
                        a.site_id < b.site_id ? -1 : a.site_id > b.site_id ? 1 : 0,
                    );
                }
            });
        });
    };

    addTarget = (targets: { name: any; site_id: any }[], name: string, site_id: any) => {
        if (!targets.some((t) => t.name === name && t.site_id === site_id)) {
            targets.push({ name, site_id });
        }
    };
    fixTargets = () => {
        this.data.services.forEach(
            (service: {
                targets: { site_id: any }[];
                requests_handled: any[];
                address: string;
                connections_egress: any[];
            }) => {
                if (!service.targets) {
                    service.targets = [];
                }
                if (service.requests_handled) {
                    service.requests_handled.forEach((request) => {
                        for (const server in request.by_server) {
                            this.addTarget(service.targets as any, server, request.site_id);
                            this.addTarget(
                                service.targets as any,
                                service.address,
                                request.site_id,
                            );
                        }
                    });
                } else if (service.connections_egress) {
                    // tcp service without targets
                    if (service.connections_egress.length > 0) {
                        service.connections_egress.forEach((egress) => {
                            for (const connection_id in egress.connections) {
                                const connection = egress.connections[connection_id];
                                this.addTarget(
                                    service.targets as any,
                                    connection.server,
                                    egress.site_id,
                                );
                            }
                            this.addTarget(service.targets as any, service.address, egress.site_id);
                        });
                    } else {
                        /*
          // put this tcp service in an "unknown" site
          if (!this.data.sites.some((site) => site.site_name === "unknown")) {
            this.data.sites.push({
              site_name: "unknown",
              site_id: "unknownID",
              connected: [],
              namespace: "",
              url: "",
              edge: false,
            });
          }
          this.addTarget(service.targets, service.address, "unknownID");
          */
                    }
                }
                if (service.targets[0]) {
                    this.addTarget(
                        service.targets as any,
                        service.address,
                        service.targets[0].site_id,
                    );
                }
            },
        );
    };

    removeEmptyServices = () => {
        this.data.emptyHttpServices = [];
        for (let i = this.data.services.length - 1; i >= 0; i--) {
            const service = this.data.services[i];
            if (service.requests_received && service.requests_received.length === 0) {
                this.data.emptyHttpServices.push({ ...service });
                this.data.services.splice(i, 1);
            }
        }
    };

    findClientInTargets = (client: any, site_id: any) => {
        for (let i = 0; i < this.data.services.length; i++) {
            const service = this.data.services[i];
            const target = service.targets.find(
                (t: { name: any; site_id: any }) => t.name === client && t.site_id === site_id,
            );
            if (target) {
                return { service, target };
            }
        }

        return {};
    };

    // used to add a derived service in the case where there are clients
    // that don't receive messages / have no connections_egress
    newService = ({ address, protocol = 'http', client, site_id }: any) => {
        const service: any = {
            derived: !this.data.emptyHttpServices.some(
                (s: { address: any }) => s.address === address,
            ),
            isExternal: utils.isIP(address) || address === 'undefined',
            address,
            protocol,
            targets: [{ name: client, site_id }],
        };
        if (protocol === 'http') {
            service.requests_received = [];
            service.requests_handled = [];
        } else {
            service.connections_ingress = [];
            service.connections_egress = [];
        }

        return service;
    };

    addTargetToService = (
        service: {
            derived?: boolean;
            isExternal?: boolean;
            address?: any;
            protocol?: string;
            targets: any;
        },
        name: string,
        site_id: any,
    ) => {
        if (!service.targets) {
            service.targets = [];
        }
        if (
            !service.targets.some(
                (t: { name: any; site_id: any }) => t.name === name && t.site_id === site_id,
            )
        ) {
            service.targets.push({ name, site_id });
        }
    };

    // add a service for each client that sends requests but
    // isn't in the service list.
    // The data structure only contains services that recieve requests.
    // This will add a service entry for clients that only send requests.
    // Note: if the client address is an ip address, it is not contained
    // in a site.
    addSendersServices = () => {
        this.data.services.forEach(
            (service: {
                requests_received: any[];
                connections_egress: any[];
                connections_ingress: any[];
            }) => {
                if (service.requests_received) {
                    service.requests_received.forEach(
                        (request: { by_client: any; site_id: any }) => {
                            for (const clientKey in request.by_client) {
                                const clientName = this.serviceNameFromClientId(clientKey);
                                const found = this.data.services.find(
                                    (s: { address: any }) => s.address === clientName,
                                );
                                if (!found) {
                                    // this is a new service. add it
                                    const newService = this.newService({
                                        address: clientName,
                                        client: clientKey,
                                        site_id: request.site_id,
                                    });
                                    this.data.services.unshift(newService);
                                    this.addTargetToService(
                                        newService,
                                        utils.shortName(clientName),
                                        request.site_id,
                                    );
                                } else if (found.derived) {
                                    this.addTargetToService(
                                        found,
                                        utils.shortName(clientKey),
                                        request.site_id,
                                    );
                                }
                            }
                        },
                    );
                } else if (service.connections_egress) {
                    service.connections_egress.forEach(
                        (connection_egress: { connections: any }) => {
                            //const site_id = connection_egress.site_id;
                            const connections = connection_egress.connections;
                            for (const egress_connection_id in connections) {
                                service.connections_ingress.forEach(
                                    (connection_ingress: { site_id: any; connections: any }) => {
                                        const ingress_site_id = connection_ingress.site_id;
                                        const ingress_connections = connection_ingress.connections;
                                        if (
                                            Object.keys(ingress_connections).includes(
                                                egress_connection_id,
                                            )
                                        ) {
                                            const client =
                                                ingress_connections[egress_connection_id].client;
                                            const targetInfo = this.findClientInTargets(
                                                client,
                                                ingress_site_id,
                                            );
                                            if (!targetInfo.target) {
                                                const newService = this.newService({
                                                    address: client,
                                                    protocol: 'tcp',
                                                    client,
                                                    site_id: ingress_site_id,
                                                });
                                                this.data.services.unshift(newService);
                                                this.addTargetToService(
                                                    newService,
                                                    client,
                                                    ingress_site_id,
                                                );
                                            }
                                        }
                                    },
                                );
                            }
                        },
                    );
                } else if (service.connections_ingress) {
                    service.connections_ingress.forEach(
                        (ingress: {
                            connections: { [x: string]: { client: any } };
                            site_id: any;
                        }) => {
                            for (const connectionID in ingress.connections) {
                                const client = ingress.connections[connectionID].client;
                                // look for client in a target section
                                const targetInfo = this.findClientInTargets(
                                    client,
                                    ingress.site_id,
                                );
                                if (!targetInfo.target) {
                                    const newService = this.newService({
                                        address: client,
                                        protocol: 'tcp',
                                        client,
                                        site_id: ingress.site_id,
                                    });
                                    this.data.services.unshift(newService);
                                    this.addTargetToService(newService, client, ingress.site_id);
                                }
                            }
                        },
                    );
                }
            },
        );
    };

    // add a list of resident services to each cluster
    addServicesToClusters = () => {
        this.data.sites.forEach((site: { services: any; site_id: any }) => {
            site.services = this.data.services.filter((service: { targets: any[] }) =>
                service.targets.some((target: { site_id: any }) => target.site_id === site.site_id),
            );
        });
    };

    addServersToSites = () => {
        this.data.sites.forEach((site: { servers: any[]; site_id: any }) => {
            site.servers = [];
            this.data.services.forEach((service: { targets: any[] }) => {
                service.targets.forEach((target: { site_id: any; name: any }) => {
                    if (target.site_id === site.site_id) {
                        site.servers.push(target.name);
                    }
                });
            });
        });
    };

    // create links between [site:serivce]
    createDeployments = () => {
        this.data.deployments = [];
        this.data.deploymentLinks = [];
        this.data.services.forEach((service: { address: any }) => {
            const sites = this.getServiceSites(service as any);
            sites.forEach((site) => {
                this.data.deployments.push({
                    service,
                    site,
                    key: `${service.address} (${site.site_id})`,
                });
            });
        });
        this.data.deployments.forEach(
            (fromDeployment: { service: any; site: { site_id: any }; key: any }) => {
                this.data.deployments.forEach(
                    (toDeployment: { service: any; site: { site_id: any }; key: any }) => {
                        const request = this.fromTo2(
                            fromDeployment.service,
                            fromDeployment.site.site_id,
                            toDeployment.service,
                            toDeployment.site.site_id,
                        );
                        if (Object.keys(request).length > 0) {
                            this.data.deploymentLinks.push({
                                source: fromDeployment,
                                target: toDeployment,
                                request,
                                key: `${fromDeployment.key}-${toDeployment.key}`,
                            });
                        }
                    },
                );
            },
        );
    };

    getDeploymentLinks = (showExternal = SHOW_EXTERNAL) => {
        if (!showExternal) {
            return this.data.deploymentLinks.filter(
                (link: {
                    source: { service: { isExternal: any } };
                    target: { service: { isExternal: any } };
                }) => !link.source.service.isExternal && !link.target.service.isExternal,
            );
        }

        return this.data.deploymentLinks;
    };

    fromTo2 = (
        from: any,
        fromSite: any,
        to: {
            targets: any[];
            requests_received: string | any[];
            connections_egress: string | any[];
            connections_ingress: string | any[];
        },
        toSite: string | number,
    ) => {
        const req = {};
        if (to.targets.some((t: { site_id: any }) => t.site_id === toSite)) {
            if (to.requests_received) {
                for (let r = 0; r < to.requests_received.length; r++) {
                    const request = to.requests_received[r];
                    if (request.site_id === fromSite) {
                        for (const client in request.by_client) {
                            const clientService = this.data.services.find((s: { targets: any[] }) =>
                                s.targets.some(
                                    (t: { name: string; site_id: any }) =>
                                        t.name === client && t.site_id === fromSite,
                                ),
                            );
                            if (from === clientService) {
                                utils.aggregateAttributes(
                                    request.by_client[client].by_handling_site[toSite],
                                    req,
                                );
                            }
                        }
                    }
                }
            } else if (to.connections_egress) {
                for (let e = 0; e < to.connections_egress.length; e++) {
                    const egress = to.connections_egress[e];
                    if (egress.site_id === toSite) {
                        for (const connectionID in egress.connections) {
                            if (to.connections_ingress) {
                                for (let i = 0; i < to.connections_ingress.length; i++) {
                                    const ingress = to.connections_ingress[i];
                                    if (ingress.site_id === fromSite) {
                                        const connection = ingress.connections[connectionID];
                                        if (connection) {
                                            const client = connection.client;

                                            const clientService = this.data.services.find(
                                                (s: { targets: any[] }) =>
                                                    s.targets.some(
                                                        (t: { name: any; site_id: any }) =>
                                                            t.name === client &&
                                                            t.site_id === fromSite,
                                                    ),
                                            );

                                            if (from === clientService) {
                                                utils.aggregateAttributes(connection, req);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return req;
    };

    findCallingServices = (service: {
        requests_received: any;
        connections_egress: any[];
        connections_ingress: any[];
    }) => {
        let serviceAddresses = [];
        if (service.requests_received) {
            serviceAddresses = this.servicesFromRequests(service.requests_received);
        } else if (service.connections_egress) {
            service.connections_egress.forEach((egress: { connections: any }) => {
                for (const connectionID in egress.connections) {
                    if (service.connections_ingress) {
                        service.connections_ingress.forEach(
                            (ingress: { connections: { [x: string]: any } }) => {
                                const ingressConnection = ingress.connections[connectionID];
                                if (ingressConnection) {
                                    const client = ingressConnection.client;
                                    const sourceService = this.serviceNameFromClientId(client);
                                    if (sourceService) {
                                        serviceAddresses.push(sourceService);
                                    }
                                }
                            },
                        );
                    }
                }
            });
        }

        return [...new Set(serviceAddresses)];
    };
    // add source and target list for each service
    addSourcesTargets = () => {
        this.data.services.forEach(
            (service: { sourceServices: any[]; targetServices: never[] }) => {
                if (!service.sourceServices) {
                    service.sourceServices = [];
                }
                if (!service.targetServices) {
                    service.targetServices = [];
                }
                // find all services that call this service
                const sourcesAddresses = this.findCallingServices(service as any);
                // add a referece to the sources and targets
                sourcesAddresses.forEach((sourceAddress) => {
                    const source = this.data.services.find(
                        (s: { address: any }) => s.address === sourceAddress,
                    );
                    if (source) {
                        service.sourceServices.push(source);
                        if (!source.targetServices) {
                            source.targetServices = [];
                        }
                        source.targetServices.push(service);
                    }
                });
            },
        );
    };

    // return a list of service names in a requests list
    servicesFromRequests = (requests: any[]) => {
        const serviceList: any[] = [];
        if (requests) {
            requests.forEach((request: { by_client: {} }) => {
                const names = Object.keys(request.by_client).map((key) =>
                    this.serviceNameFromClientId(key),
                );
                serviceList.push(...names);
            });
        }

        return serviceList;
    };

    // return a request record for traffic between source and target services
    linkRequest = (sourceAddress: any, target: any, target_site: any, source_site: any) => {
        let req: any = {};
        if (target.requests_received) {
            target.requests_received.forEach(
                (request: { by_client: { [x: string]: { [x: string]: any } } }) => {
                    for (const client_id in request.by_client) {
                        if (this.serviceNameFromClientId(client_id) === sourceAddress) {
                            utils.aggregateAttributes(request.by_client[client_id], req);
                        }
                    }
                },
            );
        } else {
            target.connections_egress.forEach(
                (egress: { site_id: any; connections: { [x: string]: any } }) => {
                    if (!target_site || target_site === egress.site_id) {
                        for (const connectionID in egress.connections) {
                            for (let i = 0; i < target.connections_ingress.length; i++) {
                                const ingress = target.connections_ingress[i];
                                if (!source_site || ingress.site_id === source_site) {
                                    const ingressConnection = ingress.connections[connectionID];
                                    if (ingressConnection) {
                                        const client = ingressConnection.client;
                                        const sourceService = this.serviceNameFromClientId(client);
                                        if (sourceService) {
                                            if (sourceService === sourceAddress) {
                                                const match = egress.connections[connectionID];
                                                if (req.start_time) {
                                                    req.bytes_out += match.bytes_out;
                                                    req.bytes_in += match.bytes_in;
                                                } else {
                                                    req = JSON.parse(
                                                        JSON.stringify(
                                                            egress.connections[connectionID],
                                                        ),
                                                    );
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            );
        }
        if (req.start_time) {
            const o = req.bytes_out;
            req.bytes_out = req.bytes_in;
            req.bytes_in = o;
        }

        return req;
    };

    // get list of attributes in requests.
    // Rather than hard-code which attributes are in a request,
    // we can get them out of one of the requests
    requestAttributes = () => {
        for (let s = 0; s < this.data.services.length; s++) {
            const service = this.data.services[s];
            for (let r = 0; r < service.requests_received.length; r++) {
                const request = service.requests_received[r];
                const keys = Object.keys(request.by_client);
                if (keys.length > 0) {
                    return Object.keys(request.by_client[keys[0]]).filter(
                        (k) => !['details', 'by_handling_site'].includes(k),
                    );
                }
            }
        }
    };

    serviceNameFromClientId = (server_key: string) => {
        let serviceName = server_key;
        this.data.services.some((service: { targets: any[]; address: any }) =>
            service.targets.some((target: { name: any }) => {
                if (target.name === server_key) {
                    serviceName = service.address;

                    return true;
                }

                return false;
            }),
        );

        return serviceName;
    };

    serviceFromServer = (server: any, site_id: any) =>
        this.data.services.find((service: { targets: any[] }) =>
            service.targets.some(
                (t: { name: any; site_id: any }) => t.name === server && t.site_id === site_id,
            ),
        );

    findService = (address: any) =>
        this.data.services.find((s: { address: any }) => s.address === address);
    findSite = (site_id: any) =>
        this.data.sites.find((s: { site_id: any }) => s.site_id === site_id);
    findAllTargets = (service: { targets: any[]; address: any }) =>
        service.targets.filter((t: { name: any }) => t.name === service.address);

    // get a list of sites the given service is resident in
    getServiceSites = (service: any) => {
        const sites: any[] = [];
        // for tcp services
        if (service.protocol === 'tcp') {
            if (service.connections_egress && service.connections_egress.length > 0) {
                service.connections_egress.forEach((connection: { site_id: any }) => {
                    sites.push(this.findSite(connection.site_id));
                });
            } else {
                const targets = this.findAllTargets(service);
                if (targets) {
                    targets.forEach((t: { site_id: any }) => {
                        sites.push(this.findSite(t.site_id));
                    });
                }
            }
        } else {
            // for http services
            if (service.requests_handled) {
                if (service.requests_handled.length === 0) {
                    // service that only sends requests
                    const targets = this.findAllTargets(service);
                    if (targets) {
                        targets.forEach((t: { site_id: any }) => {
                            sites.push(this.findSite(t.site_id));
                        });
                    }
                }
                service.requests_handled.forEach((request: { site_id: any }) => {
                    sites.push(this.findSite(request.site_id));
                });
            } else {
                const targets = this.findAllTargets(service);
                if (targets) {
                    targets.forEach((t: { site_id: any }) => {
                        sites.push(this.findSite(t.site_id));
                    });
                }
            }
        }

        return sites;
    };
    siteNameFromId = (site_id: any) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const site = this.data.sites.find((site: { site_id: any }) => site.site_id === site_id);
        if (site) {
            return site.site_name;
        }
    };

    // gather raw data for all services that are involved with the given service
    matrix = (involvingService: { address: any }, stat: string) => {
        if (!stat) {
            stat = 'bytes_out';
        }
        const matrix: {
            ingress: any;
            egress: any;
            address: any;
            info: {
                source: { site_name: any; site_id: any; address: any };
                target: { site_name: any; site_id: any; address: any };
            };
            messages: any;
        }[] = [];
        const deploymentLinks = this.getDeploymentLinks();
        deploymentLinks.forEach(
            (link: {
                source: { service: { address: any }; site: { site_name: any; site_id: any } };
                target: { service: { address: any }; site: { site_name: any; site_id: any } };
                request: { [x: string]: any };
            }) => {
                if (
                    link.source.service.address === involvingService.address ||
                    link.target.service.address === involvingService.address
                ) {
                    const row = {
                        ingress: link.source.service.address,
                        egress: link.target.service.address,
                        address: involvingService.address,
                        info: {
                            source: {
                                site_name: link.source.site.site_name,
                                site_id: link.source.site.site_id,
                                address: link.source.service.address,
                            },
                            target: {
                                site_name: link.target.site.site_name,
                                site_id: link.target.site.site_id,
                                address: link.target.service.address,
                            },
                        },
                        messages: link.request[stat] !== undefined ? link.request[stat] : 0,
                    };
                    const found = matrix.find(
                        (r) =>
                            r.ingress === link.source.service.address &&
                            r.egress === link.target.service.address,
                    );
                    if (found) {
                        utils.aggregateAttributes(row, found);
                    } else {
                        matrix.push(row);
                    }
                }
            },
        );

        return matrix;
    };

    // get a matrix for sites involved with the given site
    siteMatrixForSite = (site: { site_name: any }, stat: string) => {
        if (!stat) {
            stat = 'bytes_out';
        }
        const matrix = this.siteMatrix(stat);
        for (let i = matrix.length - 1; i >= 0; --i) {
            if (matrix[i].ingress !== site.site_name && matrix[i].egress !== site.site_name) {
                matrix.splice(i, 1);
            }
        }

        return matrix;
    };

    // gather matrix records between sites
    siteMatrix = (stat: string) => {
        const matrix: {
            ingress: any;
            egress: any;
            address: any;
            messages: any;
            request: any;
            info: {
                source: { site_name: any; site_id: any; address: any };
                target: { site_name: any; site_id: any; address: any };
            };
        }[] = [];
        if (!stat) {
            stat = 'bytes_out';
        }
        const deploymentLinks = this.getDeploymentLinks();
        deploymentLinks.forEach(
            (link: {
                source: { site: { site_id: any; site_name: any }; service: { address: any } };
                target: { site: { site_id: any; site_name: any }; service: { address: any } };
                request: { [x: string]: any };
            }) => {
                if (link.source.site.site_id !== link.target.site.site_id) {
                    matrix.push({
                        ingress: link.source.site.site_name,
                        egress: link.target.site.site_name,
                        address: link.source.service.address,
                        messages: link.request[stat],
                        request: link.request,
                        info: {
                            source: {
                                site_name: link.source.site.site_name,
                                site_id: link.source.site.site_id,
                                address: link.source.service.address,
                            },
                            target: {
                                site_name: link.target.site.site_name,
                                site_id: link.target.site.site_id,
                                address: link.target.service.address,
                            },
                        },
                    });
                }
            },
        );

        return matrix;
    };

    allServiceMatrix = (stat: string) => {
        const matrix: {
            ingress: any;
            egress: any;
            address: any;
            messages: any;
            info: {
                source: { site_name: any; site_id: any };
                target: { site_name: any; site_id: any };
            };
        }[] = [];
        if (!stat) {
            stat = 'bytes_out';
        }
        const deploymentLinks = this.getDeploymentLinks();
        deploymentLinks.forEach(
            (link: {
                source: { service: { address: any }; site: { site_name: any; site_id: any } };
                target: { service: { address: any }; site: { site_name: any; site_id: any } };
                request: { [x: string]: any };
            }) => {
                matrix.push({
                    ingress: link.source.service.address,
                    egress: link.target.service.address,
                    address: link.target.service.address,
                    messages: link.request[stat] || 0,
                    info: {
                        source: {
                            site_name: link.source.site.site_name,
                            site_id: link.source.site.site_id,
                        },
                        target: {
                            site_name: link.target.site.site_name,
                            site_id: link.target.site.site_id,
                        },
                    },
                });
            },
        );

        return matrix;
    };

    // get the cumulative stat for traffic between sites
    siteToSite = (from: { site_id: any }, to: { site_id: any }, stat: string) => {
        if (!stat) {
            stat = 'bytes_out';
        }
        let value: number | null = null;
        this.data.deploymentLinks.forEach(
            (deploymentLink: {
                source: { site: { site_id: any } };
                target: { site: { site_id: any } };
                request: { [x: string]: any };
            }) => {
                if (
                    deploymentLink.source.site.site_id === from.site_id &&
                    deploymentLink.target.site.site_id === to.site_id
                ) {
                    if (!value) {
                        value = 0;
                    }
                    value += deploymentLink.request[stat];
                }
            },
        );

        return value;
    };

    fromTo = (
        from_name: any,
        from_site_id: any,
        to_name: any,
        to_site_id: string | number,
        stat: string,
    ) => {
        if (!stat) {
            stat = 'bytes_out';
        }
        const toService = this.data.services.find((s: { address: any }) => s.address === to_name);
        if (toService) {
            if (toService.requests_received) {
                const request = toService.requests_received.find(
                    (r: { site_id: any }) => r.site_id === from_site_id,
                );
                if (request) {
                    for (const clientKey in request.by_client) {
                        const address = this.serviceNameFromClientId(clientKey);
                        if (from_name === address) {
                            const client_request = request.by_client[clientKey];
                            const from_request = client_request.by_handling_site[to_site_id];
                            if (from_request) {
                                return {
                                    stat: stat !== 'none' ? from_request[stat] : 0,
                                    request: from_request,
                                };
                            }
                        }
                    }
                }
            } else if (toService.connections_egress) {
                // tcp service
                for (let e = 0; e < toService.connections_egress.length; e++) {
                    const egress = toService.connections_egress[e];
                    if (egress.site_id === to_site_id) {
                        for (const connectionID in egress.connections) {
                            for (let i = 0; i < toService.connections_ingress.length; i++) {
                                const ingress = toService.connections_ingress[i];
                                if (ingress.site_id === from_site_id) {
                                    if (Object.keys(ingress.connections).includes(connectionID)) {
                                        const request = egress.connections[connectionID];
                                        const clientID = ingress.connections[connectionID].client;
                                        // find the service that has clientID as a server
                                        const fromService = this.serviceFromServer(
                                            clientID,
                                            from_site_id,
                                        );
                                        if (fromService && fromService.address === from_name) {
                                            return {
                                                stat: stat !== 'none' ? request[stat] : 0,
                                                request,
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return { stat: undefined, request: undefined };
    };

    serviceNames = () => this.data.services.map((s: { address: any }) => s.address);

    requestSum = (req: { by_server: { [x: string]: { requests: number } } }) => {
        let sum = 0;
        for (const server in req.by_server) {
            sum += req.by_server[server].requests;
        }

        return sum;
    };
    requestSums = (service: { [x: string]: any[] }, key: string | number) => {
        const sums: { site_name: any; sum: number }[] = [];
        if (service[key]) {
            service[key].forEach((request: { site_id: any }) => {
                sums.push({
                    site_name:
                        this.siteNameFromId(request.site_id) || `${request.site_id} doesn't exist`,
                    sum: this.requestSum(request as any),
                });
            });
        }

        return sums;
    };
}
export default Adapter;
