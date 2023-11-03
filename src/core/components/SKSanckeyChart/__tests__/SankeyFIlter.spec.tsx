import { render, fireEvent, waitFor } from '@testing-library/react';

import SankeyFilter from './../SankeyFilter';
import { ServiceClientResourceOptions, ServiceServerResourceOptions, sankeyMetricOptions } from '../SkSankey.constants';

describe('SankeyFilter', () => {
  it('should render the SankeyFilter component', () => {
    const { getByTestId } = render(<SankeyFilter />);

    expect(getByTestId('sankey-filter')).toBeInTheDocument();
  });

  it('should open and select client resource', async () => {
    const { getByText } = render(<SankeyFilter />);

    // Find and click the client resource toggle button
    const clientToggle = getByText(ServiceClientResourceOptions[0].name);
    fireEvent.click(clientToggle);

    // Find and click the "Client sites" option
    const clientOption = getByText(ServiceClientResourceOptions[1].name);
    fireEvent.click(clientOption);

    await waitFor(() => {
      // Assert that the client resource has been selected
      const selectedClient = getByText(ServiceClientResourceOptions[1].name);
      expect(selectedClient).toBeInTheDocument();
    });
  });

  it('should open and select server resource', async () => {
    const { getByText } = render(<SankeyFilter />);

    // Find and click the server resource toggle button
    const serverToggle = getByText(ServiceServerResourceOptions[0].name);
    fireEvent.click(serverToggle);

    // Find and click the "Server processes" option
    const serverOption = getByText(ServiceServerResourceOptions[1].name);
    fireEvent.click(serverOption);

    await waitFor(() => {
      // Assert that the server resource has been selected
      const selectedServer = getByText(ServiceServerResourceOptions[1].name);
      expect(selectedServer).toBeInTheDocument();
    });
  });

  it('should open and select a metric', async () => {
    const { getByText } = render(<SankeyFilter />);

    // Find and click the metric toggle button
    const metricToggle = getByText(sankeyMetricOptions[0].name);
    fireEvent.click(metricToggle);

    // Find and click a metric option
    const metricOption = getByText(sankeyMetricOptions[1].name);
    fireEvent.click(metricOption);

    // Assert that the metric has been selected
    await waitFor(() => {
      const selectedMetric = getByText(sankeyMetricOptions[1].name);
      expect(selectedMetric).toBeInTheDocument();
    });
  });
});
