import React, { memo } from 'react';

import { SiteData } from '../services/services.interfaces';

interface OverviewProps {
  data: SiteData | undefined;
}

const Overview = memo(({ data }: OverviewProps) => {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
});

export default Overview;
