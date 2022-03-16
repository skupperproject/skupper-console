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

export interface FlowsResponse {
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
