import { HostResponse, LinkResponse, ProcessResponse, SiteResponse } from 'API/REST.interfaces';

export interface Site extends SiteResponse {
    hosts: HostResponse[];
    processes: ProcessResponse[];
    linkedSites: LinkResponse[];
}
