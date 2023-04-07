import { render, screen } from '@testing-library/react';

import ResourceIcon from './index';

describe('ResourceIcon', () => {
  it('renders the Skupper icon for the skupper type', () => {
    render(<ResourceIcon type="skupper" />);
    const img = screen.getByRole('img', { name: 'Skupper Icon' });
    expect(img).toBeInTheDocument();
  });

  test('renders site icon', () => {
    render(<ResourceIcon type="site" />);

    const el = screen.getByRole('site-resource-icon');

    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('sk-resource-icon', 'sk-resource-site');
    expect(el).toHaveTextContent('S');
  });

  test('renders process icon', () => {
    render(<ResourceIcon type="process" />);

    const el = screen.getByRole('process-resource-icon');

    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('sk-resource-icon', 'sk-resource-process');
    expect(el).toHaveTextContent('P');
  });

  test('renders component icon', () => {
    render(<ResourceIcon type="service" />);

    const el = screen.getByRole('service-resource-icon');

    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('sk-resource-icon', 'sk-resource-process-group');
    expect(el).toHaveTextContent('C');
  });

  test('renders address icon', () => {
    render(<ResourceIcon type="address" />);

    const el = screen.getByRole('address-resource-icon');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('sk-resource-icon', 'sk-resource-address');
    expect(el).toHaveTextContent('A');
  });
});
