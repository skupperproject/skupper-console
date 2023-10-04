import { Suspense } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
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
    const onSelect = jest.fn();

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <DateTimePicker
            defaultDate={formatDate}
            defaultTime={formatTime}
            isDisabled={false}
            startDate={new Date()}
            onSelect={onSelect}
          />
        </Suspense>
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('data-picker-calendar-button'));
  });
});
