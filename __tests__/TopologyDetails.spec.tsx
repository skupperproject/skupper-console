import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import processesPairsData from '../mocks/data/PROCESS_PAIRS.json';
import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import { DEFAULT_COMPLEX_STRING_SEPARATOR } from '../src/config/app';
import TopologyDetails from '../src/pages/Topology/components/TopologyDetails';
import { Providers } from '../src/providers';
import { ProcessPairsResponse, ProcessResponse } from '../src/types/REST.interfaces';

const processesResults = processesData.results as ProcessResponse[];
const processPairsResults = processesPairsData.results as ProcessPairsResponse[];

describe('Topology details', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('should render a list of processes when modalType is "process"', () => {
    const items = processesResults;
    const ids = [processesResults[1].identity, processesResults[12].identity];

    render(
      <Providers>
        <TopologyDetails
          ids={ids}
          items={items}
          modalType="process"
          metrics={{
            sourceToDestBytes: [
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[12].name
                },
                value: [1722715709.263, 38]
              },
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[12].name
                },
                value: [1722715709.263, 38]
              }
            ],
            destToSourceBytes: [
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[12].name
                },
                value: [1722715709.263, 38]
              },
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[12].name
                },
                value: [1722715709.263, 38]
              }
            ],
            sourceToDestByteRate: [
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[12].name
                },
                value: [1722715709.263, 38]
              },
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[12].name
                },
                value: [1722715709.263, 38]
              }
            ],
            destToSourceByteRate: [
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[12].name
                },
                value: [1722715709.263, 38]
              },
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[12].name
                },
                value: [1722715709.263, 38]
              }
            ]
          }}
        />
      </Providers>
    );

    expect(screen.getAllByText(processesResults[12].componentName)[0]).toBeInTheDocument();
    expect(screen.getAllByText(processesResults[12].siteName)[0]).toBeInTheDocument();
    expect(
      screen.getAllByText(
        (processesResults[12].services as string[])[0]?.split(DEFAULT_COMPLEX_STRING_SEPARATOR)[0] as string
      )[0]
    ).toBeInTheDocument();
  });

  it('should render a list of process pairs when modalType is "process-pair"', () => {
    const items = processPairsResults;
    const ids = [processPairsResults[2].identity];

    render(
      <Providers>
        <TopologyDetails
          ids={ids}
          items={items}
          modalType="processPair"
          metrics={{
            sourceToDestBytes: [
              {
                metric: {
                  destProcess: processPairsResults[2].destinationName,
                  sourceProcess: processPairsResults[2].sourceName
                },
                value: [1722715709.263, 38]
              }
            ],
            destToSourceBytes: [
              {
                metric: {
                  destProcess: processPairsResults[2].destinationName,
                  sourceProcess: processPairsResults[2].sourceName
                },
                value: [1722715709.263, 38]
              }
            ],
            sourceToDestByteRate: [
              {
                metric: {
                  destProcess: processPairsResults[2].destinationName,
                  sourceProcess: processPairsResults[2].sourceName
                },
                value: [1722715709.263, 38]
              }
            ],
            destToSourceByteRate: [
              {
                metric: {
                  destProcess: processPairsResults[2].destinationName,
                  sourceProcess: processPairsResults[2].sourceName
                },
                value: [1722715709.263, 38]
              }
            ]
          }}
        />
      </Providers>
    );

    expect(screen.getByText(processPairsResults[2].sourceName)).toBeInTheDocument();
    expect(screen.getByText(processPairsResults[2].destinationName)).toBeInTheDocument();
  });
});
