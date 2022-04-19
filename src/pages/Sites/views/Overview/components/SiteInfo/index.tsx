import React, { memo } from 'react';

import OverviewCard from '@core/components/SummaryCard';

import { SITE_INFO_HEADER } from './SiteInfo.constants';
import { SiteInfoProps } from './SiteInfo.interfaces';

const SiteInfo = memo(function ({ data }: SiteInfoProps) {
    return <OverviewCard columns={SITE_INFO_HEADER} data={[data]} noBorder={true} />;
});

export default SiteInfo;
