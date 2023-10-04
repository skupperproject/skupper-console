import { Suspense } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

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
        <Suspense fallback={<LoadingPage />}>
          <UpdateMetricsButton
            refreshIntervalDefault={refreshDataIntervalMap[1].value}
            isLoading={false}
            onClick={onClickMock}
            onRefreshIntervalSelected={onRefreshIntervalSelectedMock}
          />
        </Suspense>
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('update-metric-click'));
    expect(onClickMock).toBeCalledTimes(1);

    fireEvent.click(screen.getByTestId('update-metric-dropdown'));
    fireEvent.click(screen.getByText(refreshDataIntervalMap[2].label));
    expect(onRefreshIntervalSelectedMock).toBeCalledTimes(1);
  });
});
