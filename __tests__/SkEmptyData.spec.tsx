import { render, screen } from '@testing-library/react';

import SKEmptyData, { SkEmptyDataLabels } from '../src/core/components/SkEmptyData';

describe('SkEmptyData', () => {
  it('should render with default message', () => {
    render(<SKEmptyData />);
    expect(screen.getByText(SkEmptyDataLabels.Default)).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<SKEmptyData message="Custom Message" />);
    expect(screen.getByText('Custom Message')).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(<SKEmptyData description="This is a description" />);
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('should render with custom icon', () => {
    const CustomIcon = function () {
      return <div>Custom Icon</div>;
    };
    render(<SKEmptyData icon={CustomIcon} />);
    expect(screen.getByText('Custom Icon')).toBeInTheDocument();
  });
});
