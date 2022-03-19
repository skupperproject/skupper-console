import { AxiosRequestConfig } from 'axios';

export type FetchWithTimeoutOptions = AxiosRequestConfig;

export interface DataResponse {
  sites: [
    {
      site_name: string;
      site_id: string;
      version: string;
      connected: string[];
      namespace: string;
      url: string;
      edge: boolean;
    },
  ];
  services: [
    {
      address: string;
      protocol: string;
      targets: [
        {
          name: string;
          target: string;
          site_id: string;
        },
      ];
      connections_ingress: [
        {
          site_id: string;
          connections: {
            [address: string]: {
              id: string;
              start_time: number;
              last_out: number;
              last_in: number;
              bytes_in: number;
              bytes_out: number;
              client: string;
            };
          };
        },
      ];
      connections_egress: [
        {
          site_id: string;
          connections: {
            [address: string]: {
              start_time: number;
              last_out: number;
              last_in: number;
              bytes_in: number;
              bytes_out: number;
              server: string;
            };
          };
        },
      ];
    },
  ];
}

export interface LinksResponse {
  Name: string;
  Url: string;
  Cost: string;
  Connected: boolean;
  Configured: boolean;
  Description: string;
  Created: string;
}

export interface TargetsResponse {
  name: string;
  type: string;
  ports: {
    name: string;
    port: number;
  };
}

export interface ServicesResponse {
  name: string;
  protocol: string;
  ports: number[];
  endpoints: [
    {
      name: string;
      target: string;
      ports: {
        [port: string]: number;
      };
    },
  ];
}

interface FlowResponse {
  source_host: string;
  source_port: string;
  id: string;
  counterflow?: string | null;
  connected_to?: FlowResponse;
}

export interface FlowsResponse {
  hostname: string;
  siteName: string;
  name: string;
  rtype: string;
  protocol: string;
  dest_host: string;
  dest_port: number;
  van_address: string;
  van_port: string;
  id: string;
  flows: FlowResponse[];
}
