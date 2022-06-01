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
    connectors: Device[];
    listeners: Device[];
    flows: FlowResponse[];
};

export type MonitoringTopology = FlowsTopologyResponse;
export type VanAddresses = FlowsVanAddressesResponse;
