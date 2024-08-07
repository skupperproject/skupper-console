import { AvailableProtocols } from '@API/REST.enum';
import { ProcessResponse, RemoteFilterOptions } from '@API/REST.interfaces';

// Overview component TAB
export interface OverviewProps {
  process: ProcessResponse;
}

// Details component TAB
export interface DetailsProps {
  process: ProcessResponse;
  title?: string | JSX.Element;
}

// Processes Pairs List component TAB
export interface ProcessesPairsListProps {
  process: ProcessResponse;
}

// PROCESS PAIRS VIEW
export interface ProcessPairsContentProps {
  processPairId: string;
  sourceId: string;
  destinationId: string;
  protocol: AvailableProtocols | 'undefined';
}

// Process Details component
export type ProcessPairsDetailsProps = Omit<ProcessPairsContentProps, 'processPairId' | 'protocol'>;

export type ProcessPairsDetailsDataProps = {
  source: ProcessResponse;
  destination: ProcessResponse;
};

// Process Pairs Flows component
export type ProcessPairsFlowsProps = Omit<ProcessPairsContentProps, 'sourceId' | 'destinationId'>;

export interface RemoteFilterOptionsProtocolMap {
  [AvailableProtocols.Http]: RemoteFilterOptions;
  [AvailableProtocols.Http2]: RemoteFilterOptions;
  [AvailableProtocols.Tcp]: {
    active: RemoteFilterOptions;
    old: RemoteFilterOptions;
  };
}
