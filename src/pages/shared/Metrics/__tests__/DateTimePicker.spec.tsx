import { Suspense } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';

import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import DateTimePicker from '../components/DateTimePicker';
import { formatDate, formatTime } from '../Metrics.constants';

describe('DateTimePicker component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the DateTimePicker Filter', async () => {
    const onSelectMock = jest.fn();

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <DateTimePicker
            defaultDate={formatDate}
            defaultTime={formatTime}
            isDisabled={false}
            startDate={new Date()}
            onSelect={onSelectMock}
          />
        </Suspense>
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('date-time-picker-calendar-button'));
    // Wait for the popover to appear
    await waitFor(() => expect(screen.getByTestId('date-time-picker-calendar')).toBeInTheDocument());
  });
});
