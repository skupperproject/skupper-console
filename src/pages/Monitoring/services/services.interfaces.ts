import {
    FlowsVanAddressesResponse,
    FlowsTopologyResponse,
    FlowsDeviceResponse,
    FlowResponse,
    FlowsRouterResponse,
} from 'API/REST.interfaces';

export type Flow = FlowResponse;

interface Device extends FlowsDeviceResponse {
    routerName: string;
    namespace: string;
}

export type Connection = {
    devices: Device[];
    flows: FlowResponse[];
};

export type MonitoringTopology = FlowsTopologyResponse;
export type VanAddresses = FlowsVanAddressesResponse;

export interface ConnectionFlows extends FlowResponse {
    target: FlowResponse | null;
}

interface extendedFlow extends Flow {
    router: FlowsRouterResponse;
    device: FlowsDeviceResponse;
    parentType?: string;
}

export interface ExtendedConnectionFlows {
    startFlow: extendedFlow;
    endFlow: extendedFlow | null;
}
