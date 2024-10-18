import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import SkLinkStatusCell from '../../src/core/components/SkLinkStatusCell';

describe('SkLinkStatusCell', () => {
  const mockRouterLinkResponseUp: { destinationSiteId: string; status: 'up' } = {
    destinationSiteId: 'site-2',
    status: 'up'
  };

  const mockRouterLinkResponsePartiallyUp: { destinationSiteId: string; status: 'partially_up' } = {
    destinationSiteId: 'site-2',
    status: 'partially_up'
  };

  const mockRouterLinkResponseDown: { destinationSiteId: string; status: 'down' } = {
    destinationSiteId: 'site-2',
    status: 'down'
  };

  it('renders the success status with "up" text and CheckCircleIcon', () => {
    render(<SkLinkStatusCell data={mockRouterLinkResponseUp} />);

    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();

    expect(screen.getByText('up')).toBeInTheDocument();
  });

  it('renders the danger status with "down" text and ExclamationCircleIcon', () => {
    render(<SkLinkStatusCell data={mockRouterLinkResponseDown} />);

    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();

    expect(screen.getByText('down')).toBeInTheDocument();
  });

  it('renders the warning status with a Popover and "up" text when status is partially up', () => {
    render(<SkLinkStatusCell data={mockRouterLinkResponsePartiallyUp} />);

    expect(screen.getByText('up')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
