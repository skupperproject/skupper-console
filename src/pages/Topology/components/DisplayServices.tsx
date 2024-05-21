import { FC } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import SkSelectMultiTypeaheadCheckbox from '@core/SkMultiTypeheadWithCheckbox';
import { QueriesServices } from '@pages/Services/Services.enum';

interface DisplayServicesProps {
  initialIdsSelected?: string[];
  onSelected: (items: string[] | undefined) => void;
}

const DisplayServices: FC<DisplayServicesProps> = function ({ initialIdsSelected, onSelected: onSelect }) {
  const { data: services } = useQuery({
    queryKey: [QueriesServices.GetServices],
    queryFn: () => RESTApi.fetchServices(),
    refetchInterval: UPDATE_INTERVAL
  });

  // useQuery is async: If services are not yet available (undefined), render a disabled placeholder
  if (!services) {
    return (
      <SkSelectMultiTypeaheadCheckbox
        key={1}
        initOptions={[]}
        initIdsSelected={[]}
        onSelected={onSelect}
        isDisabled={true}
      />
    );
  }

  // Extract service options from fetched data (if available)
  const options = services?.results?.map(({ name, identity }) => ({
    key: identity,
    value: identity,
    label: name
  }));

  return (
    <SkSelectMultiTypeaheadCheckbox
      key={2}
      initIdsSelected={initialIdsSelected || options.map(({ value }) => value)}
      initOptions={options}
      onSelected={onSelect}
    />
  );
};

export default DisplayServices;
