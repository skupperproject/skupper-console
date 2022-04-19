import React from 'react';

import { RoutersStats, VanStats } from '@pages/Monitoring/services/services.interfaces';

export interface VanStatsRow extends Omit<VanStats, 'name' | 'totalBytes'> {
    totalBytes: string;
    name: React.ReactNode;
}

export interface RouterStatsRow extends Omit<RoutersStats, 'totalBytes'> {
    totalBytes: string;
}

export interface LinkStatsRow {
    routerNameStart: string;
    routerNameEnd: string;
    cost: number;
    direction: string;
    mode: string;
}
