import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import processesPairsData from '../../../mocks/data/PROCESS_PAIRS.json';
import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import { Wrapper } from '../../../src/core/components/Wrapper';
import TopologyDetails from '../../../src/pages/Topology/components/TopologyDetails';
import { ProcessPairsResponse, ProcessResponse } from '../../../src/types/REST.interfaces';

const processesResults = processesData.results as ProcessResponse[];
const processPairsResults = processesPairsData.results as ProcessPairsResponse[];

describe('NodeOrEdgeList', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render a list of processes when modalType is "process"', () => {
    const items = processesResults;
    const ids = [processesResults[0].identity, processesResults[1].identity];

    render(
      <Wrapper>
        <TopologyDetails
          ids={ids}
          items={items}
          modalType="process"
          metrics={{
            sourceToDestBytes: [
              {
                metric: {
                  destProcess: processesResults[0].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[1].name
                },
                value: [1722715709.263, 38],
                values: [] as never
              },
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[0].name
                },
                value: [1722715709.263, 38],
                values: [] as never
              }
            ],
            destToSourceBytes: [
              {
                metric: {
                  destProcess: processesResults[0].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[1].name
                },
                value: [1722715709.263, 38],
                values: [] as never
              },
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[0].name
                },
                value: [1722715709.263, 38],
                values: [] as never
              }
            ],
            sourceToDestByteRate: [
              {
                metric: {
                  destProcess: processesResults[0].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[1].name
                },
                value: [1722715709.263, 38],
                values: [] as never
              },
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[0].name
                },
                value: [1722715709.263, 38],
                values: [] as never
              }
            ],
            destToSourceByteRate: [
              {
                metric: {
                  destProcess: processesResults[0].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[1].name
                },
                value: [1722715709.263, 38],
                values: [] as never
              },
              {
                metric: {
                  destProcess: processesResults[1].name,
                  direction: 'incoming',
                  sourceProcess: processesResults[0].name
                },
                value: [1722715709.263, 38],
                values: [] as never
              }
            ],
            latencyByProcessPairs: []
          }}
        />
      </Wrapper>
    );

    expect(screen.getByText(processesResults[0].name)).toBeInTheDocument();
    expect(screen.getAllByText(processesResults[0].groupName)[0]).toBeInTheDocument();
    expect(screen.getAllByText(processesResults[0].parentName)[0]).toBeInTheDocument();
    expect(
      screen.getAllByText((processesResults[0].addresses as string[])[0]?.split('@')[0] as string)[0]
    ).toBeInTheDocument();

    expect(screen.getByText(processesResults[1].name)).toBeInTheDocument();
  });

  it('should render a list of process pairs when modalType is "process-pair"', () => {
    const items = processPairsResults;
    const ids = [processPairsResults[2].identity];

    render(
      <Wrapper>
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
                value: [1722715709.263, 38],
                values: [] as never
              }
            ],
            destToSourceBytes: [
              {
                metric: {
                  destProcess: processPairsResults[2].destinationName,
                  sourceProcess: processPairsResults[2].sourceName
                },
                value: [1722715709.263, 38],
                values: [] as never
              }
            ],
            sourceToDestByteRate: [
              {
                metric: {
                  destProcess: processPairsResults[2].destinationName,
                  sourceProcess: processPairsResults[2].sourceName
                },
                value: [1722715709.263, 38],
                values: [] as never
              }
            ],
            destToSourceByteRate: [
              {
                metric: {
                  destProcess: processPairsResults[2].destinationName,
                  sourceProcess: processPairsResults[2].sourceName
                },
                value: [1722715709.263, 38],
                values: [] as never
              }
            ],
            latencyByProcessPairs: [
              {
                metric: {
                  destProcess: processPairsResults[2].destinationName,
                  sourceProcess: processPairsResults[2].sourceName
                },
                value: [1722715709.263, 38],
                values: [] as never
              }
            ]
          }}
        />
      </Wrapper>
    );

    expect(screen.getByText(processPairsResults[2].sourceName)).toBeInTheDocument();
    expect(screen.getByText(processPairsResults[2].destinationName)).toBeInTheDocument();
  });
});
