import { render, screen } from '@testing-library/react';

import { Wrapper } from '@core/components/Wrapper';

import LinkCell from '../index';

describe('LinkCell', () => {
  const data = { id: 1, name: 'Test' };

  it('should render a disabled cell with Truncate for non-empty value', () => {
    render(<LinkCell data={data} value="Long text" isDisabled={true} link="/some-link" />);
    const truncateElement = screen.getByText('Long text');
    expect(truncateElement).toBeInTheDocument();
  });

  it('should render a non-disabled cell with Link for non-empty value', () => {
    render(
      <Wrapper>
        <LinkCell data={data} value="Long text" link="/some-link" />
      </Wrapper>
    );
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '#/some-link');
  });

  it('should render an empty cell', () => {
    render(<LinkCell data={data} value="" link="/some-link" />);
    const emptyElement = screen.getByText("''");
    expect(emptyElement).toBeInTheDocument();
  });

  it('should render a non-disabled cell with fitContent', () => {
    render(
      <Wrapper>
        <LinkCell data={data} value="Long text" link="/some-link" fitContent={true} />
      </Wrapper>
    );
    const textElement = screen.getByText('Long text');
    expect(textElement).toBeInTheDocument();
  });

  it('should handle non-string values', () => {
    render(<LinkCell data={data} value={undefined} link="/some-link" />);
    const emptyElement = screen.getByText("''");
    expect(emptyElement).toBeInTheDocument();
  });
});
