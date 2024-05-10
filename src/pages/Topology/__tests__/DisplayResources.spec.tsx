import { render } from '@testing-library/react';
import eventUser from '@testing-library/user-event';
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
    const { getByPlaceholderText } = render(
      <DisplayResources options={[]} onSelect={() => {}} placeholder={TopologyLabels.DisplayResourcesDefaultLabel} />
    );
    expect(getByPlaceholderText(TopologyLabels.DisplayResourcesDefaultLabel)).toBeInTheDocument();
  });

  it('should click on the Select and write the name of one item in the searchbar', async () => {
    const { getByPlaceholderText, queryByRole } = render(
      <DisplayResources options={processesResults} onSelect={() => {}} />
    );

    await eventUser.type(getByPlaceholderText(TopologyLabels.DisplayResourcesDefaultLabel), processesResults[0].name);

    expect(queryByRole('menuitem', { name: processesResults[0].name })).toBeInTheDocument();
    expect(queryByRole('menuitem', { name: processesResults[1].name })).not.toBeInTheDocument();
  });

  it('should click on the Select and click on an option item', async () => {
    const handleSelect = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <DisplayResources options={processesResults} onSelect={handleSelect} />
    );

    await eventUser.click(getByPlaceholderText(TopologyLabels.DisplayResourcesDefaultLabel));
    await eventUser.click(getByText(processesResults[0].name));

    expect(handleSelect).toHaveBeenCalledTimes(1);
  });
});
