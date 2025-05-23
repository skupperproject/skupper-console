import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ResourceIcon from '../src/core/components/ResourceIcon';

describe('ResourceIcon', () => {
  it('renders the Skupper icon for the skupper type', () => {
    render(<ResourceIcon type="skupper" />);
    const img = screen.getByRole('img', { name: 'Skupper Icon' });
    expect(img).toBeInTheDocument();
  });

  it('renders site icon', () => {
    render(<ResourceIcon type="site" />);

    const el = screen.getByRole('site-resource-icon');

    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('sk-resource-icon');
    expect(el).toHaveTextContent('S');
  });

  it('renders process icon', () => {
    render(<ResourceIcon type="process" />);

    const el = screen.getByRole('process-resource-icon');

    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('sk-resource-icon');
    expect(el).toHaveTextContent('P');
  });

  it('renders component icon', () => {
    render(<ResourceIcon type="component" />);

    const el = screen.getByRole('component-resource-icon');

    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('sk-resource-icon');
    expect(el).toHaveTextContent('C');
  });

  it('renders service icon', () => {
    render(<ResourceIcon type="service" />);

    const el = screen.getByRole('service-resource-icon');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('sk-resource-icon');
    expect(el).toHaveTextContent('RK');
  });
});
