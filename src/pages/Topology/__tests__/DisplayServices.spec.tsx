import { Suspense } from 'react';

import { fireEvent, render, renderHook } from '@testing-library/react';
import { Server } from 'miragejs';
import { act } from 'react-dom/test-utils';

import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import DisplayServices, { DisplayServicesContent, useServiceSelection } from '../components/DisplayServices';
import { TopologyLabels } from '../Topology.enum';

const initialIdsSelected: string[] = [];
const mockOnSelected = jest.fn();
const options = [
  { key: '1', value: '1', label: 'Service 1' },
  { key: '2', value: '2', label: 'Service 2' },
  { key: '3', value: '3', label: 'Service 3' }
];

describe('useServiceSelection', () => {
  it('should toggle service menu correctly', () => {
    const { result } = renderHook(() =>
      useServiceSelection({ initialIdsSelected: [], options, onSelected: mockOnSelected })
    );

    expect(result.current.isServiceSelectMenuOpen).toBe(false);
    act(() => {
      result.current.toggleServiceMenu(true);
    });
    expect(result.current.isServiceSelectMenuOpen).toBe(true);
  });

  it('should select and deselect services correctly', () => {
    const { result } = renderHook(() =>
      useServiceSelection({ initialIdsSelected: [], options, onSelected: mockOnSelected })
    );

    expect(result.current.serviceIdsSelected).toEqual([]);
    act(() => {
      result.current.selectService('1');
    });
    expect(result.current.serviceIdsSelected).toEqual(['1']);

    act(() => {
      result.current.selectService('1');
    });
    expect(result.current.serviceIdsSelected).toEqual([]);

    act(() => {
      result.current.selectService('2');
    });
    expect(result.current.serviceIdsSelected).toEqual(['2']);
  });

  it('should select all services correctly', () => {
    const { result } = renderHook(() =>
      useServiceSelection({ initialIdsSelected: [], options, onSelected: mockOnSelected })
    );

    expect(result.current.serviceIdsSelected).toEqual([]);
    act(() => {
      result.current.selectAllServices();
    });
    expect(result.current.serviceIdsSelected).toEqual(['1', '2', '3']);

    act(() => {
      result.current.selectAllServices();
    });
    expect(result.current.serviceIdsSelected).toEqual([]);
  });

  it('should filter services correctly', () => {
    const { result } = renderHook(() =>
      useServiceSelection({ initialIdsSelected: [], options, onSelected: mockOnSelected })
    );

    // Filtering with partial name 'Service 1'
    act(() => {
      const filteredServices = result.current.findServices('Service 1');
      expect(filteredServices).toEqual([options[0]]);
    });

    // Filtering with partial name 'service'
    act(() => {
      const filteredServices = result.current.findServices('service');
      expect(filteredServices).toEqual(options);
    });

    // Filtering with partial name 'xyz' which doesn't match any service
    act(() => {
      const filteredServices = result.current.findServices('xyz');
      expect(filteredServices).toEqual([]);
    });
  });
});

describe('DisplayServicesContent', () => {
  it('renders select component with correct props', () => {
    const { getByRole, getByText } = render(
      <DisplayServicesContent initialIdsSelected={initialIdsSelected} options={options} onSelected={mockOnSelected} />
    );

    const selectElement = getByRole('button');
    expect(selectElement).toBeInTheDocument();

    const placeholderTextElement = getByText(TopologyLabels.DisplayServicesDefaultLabel);
    expect(placeholderTextElement).toBeInTheDocument();
  });

  it('renders options correctly', () => {
    const { getByRole, getByText } = render(
      <DisplayServicesContent initialIdsSelected={initialIdsSelected} options={options} onSelected={mockOnSelected} />
    );

    const selectElement = getByRole('button');
    fireEvent.click(selectElement);

    options.forEach((option) => {
      const optionElement = getByText(option.label);
      expect(optionElement).toBeInTheDocument();
    });
  });

  it('calls selectService function on selecting an option', () => {
    const { getByRole, getByText } = render(
      <DisplayServicesContent initialIdsSelected={initialIdsSelected} options={options} onSelected={mockOnSelected} />
    );

    const selectElement = getByRole('button');
    fireEvent.click(selectElement);

    const optionToSelect = getByText('Service 1');
    fireEvent.click(optionToSelect);

    expect(mockOnSelected).toHaveBeenCalledWith(['1']);
  });

  it('filters options correctly based on search input', () => {
    const { getByRole, getByPlaceholderText, queryByText } = render(
      <DisplayServicesContent initialIdsSelected={initialIdsSelected} options={options} onSelected={mockOnSelected} />
    );

    const selectElement = getByRole('button');
    fireEvent.click(selectElement);

    const searchInput = getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'Service 1' } });

    expect(queryByText('Service 1')).toBeInTheDocument();
    expect(queryByText('Service 2')).not.toBeInTheDocument();
    expect(queryByText('Service 3')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Service' } });

    expect(queryByText('Service 1')).toBeInTheDocument();
    expect(queryByText('Service 2')).toBeInTheDocument();
    expect(queryByText('Service 3')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'xyz' } });

    expect(queryByText('Service 1')).not.toBeInTheDocument();
    expect(queryByText('Service 2')).not.toBeInTheDocument();
    expect(queryByText('Service 3')).not.toBeInTheDocument();
  });
});

describe('DisplayServices', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('renders DisplayServices component placehoder without service options an disabled', () => {
    const { getByRole } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <DisplayServices initialIdsSelected={undefined} onSelected={jest.fn()} />
        </Suspense>
      </Wrapper>
    );

    const selectElement = getByRole('button');
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toBeDisabled();
  });
});
