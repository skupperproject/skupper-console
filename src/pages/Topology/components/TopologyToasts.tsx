import { ForwardRefRenderFunction, Key, forwardRef, useImperativeHandle, useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertProps,
  AlertVariant,
  getUniqueId
} from '@patternfly/react-core';

import { TOAST_VISIBILITY_TIMEOUT } from '@config/config';

export interface ToastExposeMethods {
  addMessage: (message: string) => void;
}

interface AlertToastProps {
  variant?: AlertVariant;
  timeout?: number | boolean;
}

const AlertToast: ForwardRefRenderFunction<ToastExposeMethods, AlertToastProps> = function (
  { variant = AlertVariant.info, timeout = TOAST_VISIBILITY_TIMEOUT },
  ref
) {
  const [alerts, setAlerts] = useState<Partial<AlertProps>[]>([]);

  const addMessage = (title: string) => {
    setAlerts((prevAlerts) => [...prevAlerts, { title, key: getUniqueId() }]);
  };

  const handleRemoveAlert = (key: Key) => {
    setAlerts((prevAlerts) => [...prevAlerts.filter((alert) => alert.key !== key)]);
  };

  useImperativeHandle(ref, () => ({
    addMessage
  }));

  return (
    <AlertGroup isToast data-testid="sk-toasts">
      {alerts.map(({ key, title }, index) => (
        <Alert
          data-testid={`sk-toast-${index}`}
          key={key}
          timeout={timeout}
          variant={variant}
          title={title}
          actionClose={<AlertActionCloseButton title={title as string} onClose={() => handleRemoveAlert(key as Key)} />}
        />
      ))}
    </AlertGroup>
  );
};

export default forwardRef(AlertToast);
