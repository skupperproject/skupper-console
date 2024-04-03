import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Wrapper } from '@core/components/Wrapper';

import SkUpdateDataButton, { refreshDataIntervalMap } from '..';

describe('SkUpdateDataButton', () => {
  it('renders the component', () => {
    render(
      <Wrapper>
        <SkUpdateDataButton />
      </Wrapper>
    );

    expect(screen.getByText('Refresh off')).toBeInTheDocument();
  });

  it('Open the refresh interval select', () => {
    const onClickMock = jest.fn();
    render(
      <Wrapper>
        <SkUpdateDataButton onClick={onClickMock} />
      </Wrapper>
    );

    fireEvent.click(screen.getByText('Refresh off'));
    expect(screen.getByText(refreshDataIntervalMap[1].key)).toBeInTheDocument();
  });

  it('calls onRefreshIntervalSelected and revalidateLiveQueries when a new interval is selected', () => {
    const onRefreshIntervalSelectedMock = jest.fn();
    const revalidateLiveQueriesMock = jest.fn();

    render(
      <Wrapper>
        <SkUpdateDataButton
          onRefreshIntervalSelected={onRefreshIntervalSelectedMock}
          onClick={revalidateLiveQueriesMock}
          refreshIntervalDefault={15000}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByText(refreshDataIntervalMap[1].key));
    fireEvent.click(screen.getByText(refreshDataIntervalMap[2].key));
    expect(revalidateLiveQueriesMock).toHaveBeenCalledTimes(1);
    expect(onRefreshIntervalSelectedMock).toHaveBeenCalledWith(refreshDataIntervalMap[2].value);
  });

  it('calls revalidateLiveQueries when the interval is updated', async () => {
    const revalidateLiveQueriesMock = jest.fn();
    render(
      <Wrapper>
        <SkUpdateDataButton onClick={revalidateLiveQueriesMock} refreshIntervalDefault={15000} />
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('update-data-click'));
    await waitFor(() => expect(revalidateLiveQueriesMock).toHaveBeenCalledTimes(1));
  });
});
