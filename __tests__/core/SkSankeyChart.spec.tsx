import { render, screen, waitFor } from '@testing-library/react';

import { hexColors, styles } from '../../src/config/styles';
import SkSankeyChart, {
  addThemeChangeListener,
  getColors,
  valueFormat
} from '../../src/core/components/SKSanckeyChart/index';
import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '../../src/core/components/SKSanckeyChart/SkSankey.constants';
import { MetricsLabels } from '../../src/pages/shared/Metrics/Metrics.enum';

describe('SkSankeyChart', () => {
  it('should return an empty string if the value is the default flow value', () => {
    expect(valueFormat(DEFAULT_SANKEY_CHART_FLOW_VALUE)).toEqual('');
  });

  it('should format the value using formatByteRate if it is not the default flow value', () => {
    expect(valueFormat(1024)).toEqual('1 KB/s');
  });

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

    expect(screen.getByText(MetricsLabels.NoMetricFoundTitleMessage)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.NoMetricFoundDescriptionMessage)).toBeInTheDocument();
  });

  it('should call the callback function when the class attribute changes', async () => {
    const callback = jest.fn<void, [MutationRecord[], MutationObserver]>();

    addThemeChangeListener(callback);

    expect(callback).toHaveBeenCalledTimes(1);

    document.documentElement.setAttribute('class', 'new-class');
    // Wait for the MutationObserver to trigger the callback
    await waitFor(() => expect(callback).toHaveBeenCalledTimes(2));
  });
});
