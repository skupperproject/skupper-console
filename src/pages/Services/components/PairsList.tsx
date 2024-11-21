import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import PairsSankeyChart from './PairsSankeyChart';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import SkTable from '../../../core/components/SkTable';
import { combineInstantMetricsToPairs } from '../../../core/utils/combineInstantMetricsToPairs';
import { useServersData } from '../hooks/useServersData';
import { customServiceCells, PairColumns } from '../Services.constants';

interface PairsListProps {
  id: string;
  name: string;
}

const PairsList: FC<PairsListProps> = function ({ id, name }) {
  const { processPairs, metrics } = useServersData(id, name);

  const pairs = combineInstantMetricsToPairs({
    processesPairs: processPairs,
    metrics,
    prometheusKey: PrometheusLabelsV2.SourceProcessName,
    processPairsKey: 'sourceName'
  });

  return (
    <Stack hasGutter>
      <StackItem>
        <PairsSankeyChart pairs={pairs} />
      </StackItem>
      <StackItem>
        <SkTable columns={PairColumns} rows={pairs} customCells={customServiceCells} />
      </StackItem>
    </Stack>
  );
};

export default PairsList;
