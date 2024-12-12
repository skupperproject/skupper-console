import { render, fireEvent, waitFor } from '@testing-library/react';

import {
  ServiceClientResourceOptions,
  ServiceServerResourceOptions,
  SankeyMetricOptions
} from '../src/core/components/SKSanckeyChart/SkSankey.constants';
import SankeyFilter from '../src/core/components/SKSanckeyChart/SkSankeyFilter';

describe('SankeyFilter', () => {
  it('should render the SankeyFilter component', () => {
    const { getByTestId } = render(<SankeyFilter />);

    expect(getByTestId('sankey-filter')).toBeInTheDocument();
  });

  it('should open and select client resource', async () => {
    const { getByText } = render(<SankeyFilter />);

    // Find and click the client resource toggle button
    const clientToggle = getByText(ServiceClientResourceOptions[0].label);
    fireEvent.click(clientToggle);

    // Find and click the "Client sites" option
    const clientOption = getByText(ServiceClientResourceOptions[1].label);
    fireEvent.click(clientOption);

    await waitFor(() => {
      // Assert that the client resource has been selected
      const selectedClient = getByText(ServiceClientResourceOptions[1].label);
      expect(selectedClient).toBeInTheDocument();
    });
  });

  it('should open and select server resource', async () => {
    const { getByText } = render(<SankeyFilter />);

    // Find and click the server resource toggle button
    const serverToggle = getByText(ServiceServerResourceOptions[0].label);
    fireEvent.click(serverToggle);

    // Find and click the "Server processes" option
    const serverOption = getByText(ServiceServerResourceOptions[1].label);
    fireEvent.click(serverOption);

    await waitFor(() => {
      // Assert that the server resource has been selected
      const selectedServer = getByText(ServiceServerResourceOptions[1].label);
      expect(selectedServer).toBeInTheDocument();
    });
  });

  it('should open and select a metric', async () => {
    const { getByText } = render(<SankeyFilter />);

    // Find and click the metric toggle button
    const metricToggle = getByText(SankeyMetricOptions[0].label);
    fireEvent.click(metricToggle);

    // Find and click a metric option
    const metricOption = getByText(SankeyMetricOptions[1].label);
    fireEvent.click(metricOption);

    // Assert that the metric has been selected
    await waitFor(() => {
      const selectedMetric = getByText(SankeyMetricOptions[1].label);
      expect(selectedMetric).toBeInTheDocument();
    });
  });
});
