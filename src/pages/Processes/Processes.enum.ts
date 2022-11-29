import { ProcessResponse } from 'API/REST.interfaces';

export enum ProcessesRoutesPaths {
    Processes = '/processes',
}

export enum ProcessesTableColumns {
    Name = 'Name',
    Site = 'Site',
    SourceIP = 'Source IP',
}

export enum ProcessesLabels {
    Section = 'Processes',
    Description = '',
    Details = 'Details',
    Processes = 'Processes',
    Addresses = 'Addresses',
    Process = 'Process',
    Site = 'Site',
    ProcessGroup = 'Process Group',
    Image = 'Image',
    SourceIP = 'Source IP',
    Host = 'Host',
    MetricBytesSent = 'Top 10 processes bytes sent',
    MetricBytesReceived = 'Top 10 processes bytes received',
    CurrentBytesInfoByteRateIn = 'Incoming byte rate',
    CurrentBytesInfoByteRateOut = 'Outgoing byte rate',
}

export interface ProcessDescriptionProps {
    description: ProcessResponse & {
        addresses: { identity: string; name: string }[];
    };
}
