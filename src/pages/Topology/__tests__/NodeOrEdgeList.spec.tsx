import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import { Wrapper } from '@core/components/Wrapper';
import processesPairsData from '@mocks/data/PROCESS_PAIRS.json';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';

import NodeOrEdgeList from '../components/NodeOrEdgeList';

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
        <NodeOrEdgeList ids={ids} items={items} modalType="process" metrics={null} />
      </Wrapper>
    );

    expect(screen.getByText(processesResults[0].name)).toBeInTheDocument();
    expect(screen.getByText(`${processesResults[0].sourceHost}/${processesResults[0].hostName}`)).toBeInTheDocument();
    expect(screen.getAllByText(processesResults[0].groupName)[0]).toBeInTheDocument();
    expect(screen.getAllByText(processesResults[0].parentName)[0]).toBeInTheDocument();
    expect(
      screen.getAllByText((processesResults[0].addresses as string[])[0]?.split('@')[0] as string)[0]
    ).toBeInTheDocument();

    expect(screen.getByText(processesResults[1].name)).toBeInTheDocument();
  });

  it('should render a list of process pairs when modalType is "process-pair"', () => {
    const items = processPairsResults;
    const ids = [processPairsResults[3].identity, processPairsResults[2].identity];

    render(
      <Wrapper>
        <NodeOrEdgeList ids={ids} items={items} modalType="processPair" metrics={null} />
      </Wrapper>
    );

    expect(screen.getByText(processPairsResults[2].sourceName)).toBeInTheDocument();
    expect(screen.getByText(processPairsResults[2].destinationName)).toBeInTheDocument();
    expect(screen.getByText(processPairsResults[3].sourceName)).toBeInTheDocument();
    expect(screen.getByText(processPairsResults[3].destinationName)).toBeInTheDocument();
  });
});
