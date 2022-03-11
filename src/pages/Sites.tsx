import React, { memo } from 'react';

import { useDataVAN } from '../contexts/Data';

const Sites = memo(() => {
  const { dataVAN } = useDataVAN();
  return <pre>{JSON.stringify(dataVAN?.sites, null, 2)}</pre>;
});

export default Sites;
