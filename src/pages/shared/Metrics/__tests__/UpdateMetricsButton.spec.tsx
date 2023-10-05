import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';

import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';

import UpdateMetricsButton from '../components/UpdateMetricsButton';
import { refreshDataIntervalMap } from '../Metrics.constants';

describe('Metrics component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Metric Filter', async () => {
    const onClickMock = jest.fn();
    const onRefreshIntervalSelectedMock = jest.fn();

    render(
      <Wrapper>
        <UpdateMetricsButton
          refreshIntervalDefault={refreshDataIntervalMap[1].value}
          isLoading={false}
          onClick={onClickMock}
          onRefreshIntervalSelected={onRefreshIntervalSelectedMock}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('update-metric-click'));
    expect(onClickMock).toBeCalledTimes(1);

    fireEvent.click(screen.getByTestId('update-metric-dropdown'));
    // use waitFor to avoid this  Warning: An update to Popper inside a test was not wrapped in act(...).
    await waitFor(() => expect(screen.getByText(refreshDataIntervalMap[2].label)).toBeInTheDocument);

    fireEvent.click(screen.getByText(refreshDataIntervalMap[2].label));
    expect(onRefreshIntervalSelectedMock).toBeCalledTimes(1);
  });
});
