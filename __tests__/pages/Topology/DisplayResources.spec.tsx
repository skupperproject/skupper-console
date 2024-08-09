import { render, screen } from '@testing-library/react';
import eventUser from '@testing-library/user-event';

import DisplayResources from '../../../src/pages/Topology/components/DisplayResources';
import { TopologyLabels } from '../../../src/pages/Topology/Topology.enum';

describe('DisplayResources', () => {
  const onSelectMock = jest.fn();

  beforeEach(() => {
    render(<DisplayResources onSelect={onSelectMock} />);
  });

  it('should renders with default placeholder', () => {
    expect(screen.getByPlaceholderText(TopologyLabels.DisplayResourcesDefaultLabel)).toBeInTheDocument();
  });

  it('should calls onSelect with the correct value', async () => {
    const input = screen.getByPlaceholderText(TopologyLabels.DisplayResourcesDefaultLabel) as HTMLInputElement;
    await eventUser.type(input, 'test');

    expect(onSelectMock).toHaveBeenCalledWith('test');
    expect(input.value).toBe('test');
  });

  it('should clears the input and calls onSelect with an empty string', async () => {
    const input = screen.getByPlaceholderText(TopologyLabels.DisplayResourcesDefaultLabel) as HTMLInputElement;
    await eventUser.type(input, 'test');

    const clearButton = screen.getByLabelText('Reset');
    await eventUser.click(clearButton);

    expect(onSelectMock).toHaveBeenCalledWith('');
    expect(input.value).toBe('');
  });
});
