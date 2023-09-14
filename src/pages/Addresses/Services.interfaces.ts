import { AvailableProtocols } from '@API/REST.enum';

export interface RequestsByServiceProps {
  serviceId: string;
  serviceName: string;
  protocol: AvailableProtocols;
  viewSelected: string;
}

export type ConnectionsByServiceProps = RequestsByServiceProps;
