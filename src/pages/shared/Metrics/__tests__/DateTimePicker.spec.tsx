import { render } from '@testing-library/react';
import { Server } from 'miragejs';

import { loadMockServer } from '@mocks/server';

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
      <DateTimePicker
        defaultDate={formatDate}
        defaultTime={formatTime}
        isDisabled={false}
        startDate={new Date('2023-09-17T03:20:00')}
        onSelect={onSelectMock}
      />
    );

    // fireEvent.click(screen.getByTestId('date-time-picker-calendar-button'));
    // // Wait for the popover to appear
    // await waitFor(() => expect(screen.getByTestId('date-time-picker-calendar')).toBeInTheDocument());
  });
});
