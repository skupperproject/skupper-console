import { render, fireEvent } from '@testing-library/react';

import ViewDetailCell from '../index';

describe('ViewDetailCell', () => {
  it('should render a button with a search icon', () => {
    const { getByLabelText } = render(<ViewDetailCell value="test" />);
    const button = getByLabelText('Action');
    expect(button).toBeInTheDocument();
  });

  it('should call onClick when button is clicked', () => {
    const onClick = jest.fn();
    const { getByLabelText } = render(<ViewDetailCell value="test" onClick={onClick} />);
    const button = getByLabelText('Action');

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledWith('test');
  });
});
