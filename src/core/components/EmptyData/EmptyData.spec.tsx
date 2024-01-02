import { render, screen } from '@testing-library/react';

import { EmptyDataLabels } from './EmptyData.enum';

import EmptyData from './index';

describe('EmptyData component', () => {
  it('should render with default message', () => {
    render(<EmptyData />);
    expect(screen.getByText(EmptyDataLabels.Default)).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<EmptyData message="Custom Message" />);
    expect(screen.getByText('Custom Message')).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(<EmptyData description="This is a description" />);
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('should render with custom icon', () => {
    const CustomIcon = function () {
      return <div>Custom Icon</div>;
    };
    render(<EmptyData icon={CustomIcon} />);
    expect(screen.getByText('Custom Icon')).toBeInTheDocument();
  });
});
