import {
    FlowsVanAddressesResponse,
    FlowsTopologyResponse,
    FlowsDeviceResponse,
    FlowResponse,
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

export interface FlowExtended extends FlowResponse {
    device: string;
    routerName: string;
    protocol: string;
    namespace: string;
}

export type MonitoringTopology = FlowsTopologyResponse;
export type VanAddresses = FlowsVanAddressesResponse;

interface extendedFlow extends Flow {
    parentType?: string;
}

export interface MonitoringConnection {
    startFlow?: extendedFlow;
    endFlow?: Flow;
}
