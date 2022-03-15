import React, { memo } from 'react';

import { useDataVAN } from '../contexts/Data';

const Services = memo(() => {
  const { dataVAN } = useDataVAN();

  return <pre>{JSON.stringify(dataVAN?.services, null, 2)}</pre>;
});

export default Services;
