import { render, screen } from '@testing-library/react';
import eventUser from '@testing-library/user-event';

import { Labels } from '../src/config/labels';
import DisplayResources from '../src/pages/Topology/components/DisplayResources';

describe('DisplayResources', () => {
  const onSelectMock = jest.fn();

  beforeEach(() => {
    render(<DisplayResources onSelect={onSelectMock} />);
  });

  it('should renders with default placeholder', () => {
    expect(screen.getByPlaceholderText(Labels.FindResource)).toBeInTheDocument();
  });

  it('should calls onSelect with the correct value', async () => {
    const input = screen.getByPlaceholderText(Labels.FindResource) as HTMLInputElement;
    await eventUser.type(input, 'test');

    expect(onSelectMock).toHaveBeenCalledWith('test');
    expect(input.value).toBe('test');
  });

  it('should clears the input and calls onSelect with an empty string', async () => {
    const input = screen.getByPlaceholderText(Labels.FindResource) as HTMLInputElement;
    await eventUser.type(input, 'test');

    const clearButton = screen.getByLabelText('Reset');
    await eventUser.click(clearButton);

    expect(onSelectMock).toHaveBeenCalledWith('');
    expect(input.value).toBe('');
  });
});
