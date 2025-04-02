import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Labels } from '../src/config/labels';
import ErrorConsole from '../src/core/components/Errors/Console';
import ErrorHttp from '../src/core/components/Errors/Http';

vi.mock('../src/core/components/Errors/Http', () => ({
  default: vi.fn().mockImplementation(({ code, message, onReset }) => (
    <section data-testid="sk-network-error-view">
      <div>
        <h1>{message}</h1>
        <h2>{code}</h2>
        <hr />
        <h2>To help us resolve the issue quickly, we recommend following these steps using the DevTool browser</h2>
        <ul>
          <li>
            <span>Open the DevTool browser (F12)</span>
          </li>
          <li>
            <span>
              Navigate to the "Network" and "Console" tab. Look for any error messages or red-highlighted lines. These
              will provide essential clues about what went wrong
            </span>
          </li>
          <li>
            <span>
              Capture screenshots of the error and any relevant details displayed in the console. This will help our
              development team better understand the problem
            </span>
          </li>
          <li>
            <span>
              <button id="sk-try-again" onClick={onReset}>
                Try again
              </button>
            </span>
          </li>
        </ul>
      </div>
    </section>
  ))
}));

describe('ErrorConsole', () => {
  const resetErrorBoundary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ErrorHttp component when httpStatus is present', () => {
    const error = {
      message: 'Network error occurred',
      httpStatus: '404'
    };

    render(<ErrorConsole error={error} resetErrorBoundary={resetErrorBoundary} />);

    expect(screen.getByTestId('sk-network-error-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Network error occurred');
    expect(ErrorHttp).toHaveBeenCalledWith(
      expect.objectContaining({
        code: undefined,
        message: 'Network error occurred',
        onReset: resetErrorBoundary
      }),
      expect.anything()
    );
  });

  it('should render ErrorHttp component when code is ERR_NETWORK', () => {
    const error = {
      message: 'Failed to fetch',
      code: 'ERR_NETWORK'
    };

    render(<ErrorConsole error={error} resetErrorBoundary={resetErrorBoundary} />);

    expect(screen.getByTestId('sk-network-error-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Failed to fetch');
    expect(screen.getByRole('heading', { level: 2, name: 'ERR_NETWORK' })).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: 'Try again' });
    fireEvent.click(resetButton);
    expect(resetErrorBoundary).toHaveBeenCalled();

    expect(ErrorHttp).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'ERR_NETWORK',
        message: 'Failed to fetch',
        onReset: resetErrorBoundary
      }),
      expect.anything()
    );
  });

  it('should render application error UI with correct message and stack trace', () => {
    const error = {
      message: 'Something went wrong',
      stack: 'Error: Something went wrong\nat SomeFunction',
      code: 'APP_ERROR'
    };

    render(<ErrorConsole error={error} resetErrorBoundary={resetErrorBoundary} />);

    expect(screen.getByTestId('sk-js-error-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(Labels.ConsoleError);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Something went wrong');

    const stackTraceInput = screen.getByRole('textbox');
    expect(stackTraceInput).toHaveValue('Error: Something went wrong at SomeFunction');

    const expandableContent = screen.getByText('Error: Something went wrong', { exact: false });
    expect(expandableContent).toBeInTheDocument();
  });

  it('should handle empty stack trace gracefully', () => {
    const error = {
      message: 'Runtime error',
      stack: undefined,
      code: 'RUNTIME_ERROR'
    };

    render(<ErrorConsole error={error} resetErrorBoundary={resetErrorBoundary} />);

    expect(screen.getByTestId('sk-js-error-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Runtime error');

    const clipboardInput = screen.getByRole('textbox');
    expect(clipboardInput).toHaveValue('');
  });

  it('should handle undefined message gracefully', () => {
    const error = {
      stack: 'Error stack trace',
      code: 'UNKNOWN_ERROR'
    };

    render(<ErrorConsole error={error} resetErrorBoundary={resetErrorBoundary} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('');
  });
});
