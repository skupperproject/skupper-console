import { fireEvent, render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';

import DisplayResources from '../components/DisplayResources';
import { TopologyLabels } from '../Topology.enum';

const processesResults = processesData.results;

describe('DisplayResources', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Select with a custom placeholder', () => {
    render(
      <DisplayResources options={[]} onSelect={() => {}} placeholder={TopologyLabels.DisplayProcessesDefaultLabel} />
    );
    expect(screen.getByText(TopologyLabels.DisplayProcessesDefaultLabel)).toBeInTheDocument();
  });

  it('should click on the Select and write an display the searchbar', () => {
    render(<DisplayResources options={[]} onSelect={() => {}} />);

    fireEvent.click(screen.getByText(TopologyLabels.DisplayResourcesDefaultLabel));
    expect(screen.getByPlaceholderText(TopologyLabels.ProcessFilterPlaceholderText)).toBeInTheDocument();
  });

  it('should click on the Select and write the name of one item in the searchbar', () => {
    render(<DisplayResources options={processesResults} onSelect={() => {}} />);

    fireEvent.click(screen.getByText(TopologyLabels.DisplayResourcesDefaultLabel));
    fireEvent.change(screen.getByPlaceholderText(TopologyLabels.ProcessFilterPlaceholderText), {
      target: { value: processesResults[0].name }
    });

    expect(screen.getByRole('option', { name: processesResults[0].name })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: processesResults[1].name })).not.toBeInTheDocument();
  });

  it('should click on the Select and click on an option item', async () => {
    const handleSelect = jest.fn();

    render(<DisplayResources options={processesResults} onSelect={handleSelect} />);

    fireEvent.click(screen.getByText(TopologyLabels.DisplayResourcesDefaultLabel));
    fireEvent.click(screen.getByText(processesResults[0].name));

    expect(handleSelect).toHaveBeenCalledTimes(1);
  });
});
