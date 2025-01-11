import { render, screen } from '@testing-library/react';

import { Labels } from '../src/config/labels';
import { styles } from '../src/config/styles';
import SkSankeyChart, { getColors } from '../src/core/components/SKSanckeyChart/index';

describe('SkSankeyChart', () => {
  it('should return nodeColor if it exists', () => {
    const node = { id: 'test', nodeColor: styles.default.infoColor };
    expect(getColors(node)).toEqual(styles.default.infoColor);
  });

  it('should return the default bg color if nodeColor does not exist', () => {
    const node = { id: 'test' };
    expect(getColors(node)).toEqual(styles.default.darkBackgroundColor);
  });

  it('should render the SkSankeyChart component', () => {
    const data = {
      nodes: [{ id: 'node1' }],
      links: [{ source: 'node1', target: 'node2', value: 42 }]
    };

    const component = render(<SkSankeyChart data={data} onSearch={jest.fn()} />);
    expect(component).toMatchSnapshot();
  });

  it('should render the SkSankeyChart component with no data', () => {
    const data = {
      nodes: [],
      links: []
    };

    render(<SkSankeyChart data={data} onSearch={jest.fn()} />);

    expect(screen.getByText(Labels.NoMetricFound)).toBeInTheDocument();
    expect(screen.getByText(Labels.NoMetricFoundDescription)).toBeInTheDocument();
  });
});
