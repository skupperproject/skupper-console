import { createRef } from 'react';

import { render, waitFor } from '@testing-library/react';
import eventUser from '@testing-library/user-event';

import AlertToast, { ToastExposeMethods } from '../components/TopologyToasts';

describe('AlertToast', () => {
  it('should add a new alert when addMessage is called', async () => {
    const toastRef = createRef<ToastExposeMethods>();
    const { findByText } = render(<AlertToast ref={toastRef} />);

    const addMessage = toastRef.current?.addMessage;
    expect(addMessage).toBeDefined();

    addMessage!('This is a toast message!');
    expect(await findByText('This is a toast message!')).toBeInTheDocument();
  });

  it('should remove an alert when the close button is clicked', async () => {
    const toastRef = createRef<ToastExposeMethods>();
    const { getByTestId } = render(<AlertToast ref={toastRef} timeout={false} />);

    const addMessage = toastRef.current?.addMessage;
    expect(addMessage).toBeDefined();

    addMessage!('This is a toast message!');
    const toast = await waitFor(() => getByTestId(`sk-toast-0`));

    await eventUser.click(toast.querySelector('button') as HTMLButtonElement);
    expect(toast).not.toBeInTheDocument();
  });
});
