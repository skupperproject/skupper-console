import { ProcessResponse } from '@API/REST.interfaces';

export interface ProcessPairsProps {
  process: ProcessResponse;
}

export interface DetailsProps {
  process: ProcessResponse;
  title?: string | JSX.Element;
}

export interface OverviewProps {
  process: ProcessResponse;
}

export interface ProcessPairProcessesProps {
  sourceId: string;
  destinationId: string;
}
