import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import listenersData from '../mocks/data/LISTENERS.json';
import servicesData from '../mocks/data/SERVICES.json';
import { ListenerRoutingModel, ListenerStrategy } from '../src/API/REST.enum';
import { SUMMARY_SEPARATOR } from '../src/config/app';
import { customServiceCells } from '../src/pages/Services/Services.constants';
import { ListenerResponse, ServiceResponse } from '../src/types/REST.interfaces';

const listener = listenersData.results[0] as ListenerResponse;
const service = servicesData.results[0] as ServiceResponse;

describe('ListenerStrategyCell', () => {
  const { ListenerStrategyCell } = customServiceCells;

  it('should render the strategy and the weight for a weighted listener', () => {
    const data = { ...listener, strategy: ListenerStrategy.Weighted, strategyValue: 3 };

    render(<ListenerStrategyCell data={data} />);

    expect(screen.getByText(`Weighted ${SUMMARY_SEPARATOR} Weight: 3`)).toBeInTheDocument();
  });

  it('should render a weight of 0', () => {
    const data = { ...listener, strategy: ListenerStrategy.Weighted, strategyValue: 0 };

    render(<ListenerStrategyCell data={data} />);

    expect(screen.getByText(`Weighted ${SUMMARY_SEPARATOR} Weight: 0`)).toBeInTheDocument();
  });

  it('should render only the strategy name when the weight is missing', () => {
    const data = { ...listener, strategy: ListenerStrategy.Weighted, strategyValue: undefined };

    render(<ListenerStrategyCell data={data} />);

    expect(screen.getByText('Weighted')).toBeInTheDocument();
  });

  it('should render only the strategy name for a priority listener', () => {
    const data = { ...listener, strategy: ListenerStrategy.Priority, strategyValue: 1 };

    render(<ListenerStrategyCell data={data} />);

    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  it('should render the empty symbol when the strategy is missing', () => {
    const data = { ...listener, strategy: undefined };

    render(<ListenerStrategyCell data={data} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});

describe('ListenerTypeCell', () => {
  const { ListenerTypeCell } = customServiceCells;

  it('should render the multi-key type', () => {
    const data = { ...listener, routingModel: ListenerRoutingModel.MultiKey };

    render(<ListenerTypeCell data={data} />);

    expect(screen.getByText('Multi-key')).toBeInTheDocument();
  });

  it('should render the single-key type', () => {
    const data = { ...listener, routingModel: ListenerRoutingModel.SingleKey };

    render(<ListenerTypeCell data={data} />);

    expect(screen.getByText('Single-key')).toBeInTheDocument();
  });

  it('should render the empty symbol when the routing model is missing', () => {
    const data = { ...listener, routingModel: undefined };

    render(<ListenerTypeCell data={data} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});

describe('ListenerTypesCell', () => {
  const { ListenerTypesCell } = customServiceCells;

  it('should render both types when a service has multi-key and single-key listeners', () => {
    const data = { ...service, listenerCount: 3, multiKeyListenerCount: 1 };

    render(<ListenerTypesCell data={data} />);

    expect(screen.getByText('Multi-key, Single-key')).toBeInTheDocument();
  });

  it('should render only the multi-key type when all listeners are multi-key', () => {
    const data = { ...service, listenerCount: 2, multiKeyListenerCount: 2 };

    render(<ListenerTypesCell data={data} />);

    expect(screen.getByText('Multi-key')).toBeInTheDocument();
  });

  it('should render only the single-key type when there are no multi-key listeners', () => {
    const data = { ...service, listenerCount: 3, multiKeyListenerCount: 0 };

    render(<ListenerTypesCell data={data} />);

    expect(screen.getByText('Single-key')).toBeInTheDocument();
  });

  it('should render the empty symbol when the API does not return the multi-key count', () => {
    const data = { ...service, listenerCount: 3, multiKeyListenerCount: undefined };

    render(<ListenerTypesCell data={data} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
