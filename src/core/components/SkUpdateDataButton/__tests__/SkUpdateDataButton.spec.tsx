import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Wrapper } from '@core/components/Wrapper';

import SkUpdateDataButton, { refreshDataIntervalMap } from '..';

describe('SkUpdateDataButton component', () => {
  it('should renders the component with "Refresh off" text', () => {
    render(
      <Wrapper>
        <SkUpdateDataButton />
      </Wrapper>
    );

    expect(screen.getByText('Refresh off')).toBeInTheDocument();
  });

  it('should opens the refresh interval dropdown on button click', async () => {
    const onClickMock = jest.fn();
    render(
      <Wrapper>
        <SkUpdateDataButton onClick={onClickMock} />
      </Wrapper>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Refresh off'));
      expect(screen.getByText(refreshDataIntervalMap[1].key)).toBeInTheDocument();
    });
  });

  it('calls onRefreshIntervalSelected and revalidateLiveQueries when a new interval is selected', async () => {
    const onRefreshIntervalSelectedMock = jest.fn();
    const revalidateLiveQueriesMock = jest.fn();

    render(
      <Wrapper>
        <SkUpdateDataButton
          onRefreshIntervalSelected={onRefreshIntervalSelectedMock}
          onClick={revalidateLiveQueriesMock}
          refreshIntervalDefault={'15s'}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByText(refreshDataIntervalMap[1].key));
    fireEvent.click(screen.getByText(refreshDataIntervalMap[2].key));

    await waitFor(() => {
      // call the first one and the one inside the setInterval
      expect(revalidateLiveQueriesMock).toHaveBeenCalledTimes(2);
      expect(onRefreshIntervalSelectedMock).toHaveBeenCalledWith(refreshDataIntervalMap[2].value);
    });
  });

  it('should calls functions on refresh interval selection', async () => {
    const revalidateLiveQueriesMock = jest.fn();
    render(
      <Wrapper>
        <SkUpdateDataButton onClick={revalidateLiveQueriesMock} refreshIntervalDefault={'15s'} />
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('update-data-click'));
    await waitFor(() => expect(revalidateLiveQueriesMock).toHaveBeenCalledTimes(2));
  });
});
