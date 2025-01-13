import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import SkNavigationViewLink from '../src/core/components/SkNavigationViewLink';

describe('NavigationViewLink', () => {
  it('renders the link with the correct label and default icon', () => {
    render(
      <Router>
        <SkNavigationViewLink link="/test" linkLabel="Test Link" />
      </Router>
    );

    const linkElement = screen.getByTitle('Test Link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/test');

    const iconElement = screen.getByTestId('topologyIcon');
    expect(iconElement).toBeInTheDocument();
  });

  it('should renders the link with the correct label and specified icon', () => {
    render(
      <Router>
        <SkNavigationViewLink link="/test" linkLabel="Test Link" iconName="listIcon" />
      </Router>
    );

    const linkElement = screen.getByTitle('Test Link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/test');

    const iconElement = screen.getByTestId('listIcon');
    expect(iconElement).toBeInTheDocument();
  });
});
