import { FC } from 'react';

import { Card, Flex } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { SMALL_PAGINATION_SIZE } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import SKEmptyData from '@core/components/SkEmptyData';
import SkTable from '@core/components/SkTable';
import { combineInstantMetricsToPairs } from '@core/utils/combineInstantMetricsToPairs';
import { invertPairs } from '@core/utils/invertPairs';
import { PairsListColumns } from '@pages/Processes/Processes.constants';
import { ComponentResponse, PairsWithInstantMetrics } from '@sk-types/REST.interfaces';
import { SKTableColumn } from '@sk-types/SkTable.interfaces';

import { CustomComponentPairCells } from '../Components.constants';
import { ComponentLabels } from '../Components.enum';
import { useComponensPairsListData } from '../hooks/useComponentPairsData';

interface PairsListProps {
  component: ComponentResponse;
}

const PairsList: FC<PairsListProps> = function ({ component: { identity: id, name } }) {
  const { pairsTx, pairsRx, metricsTx, metricsRx } = useComponensPairsListData(id, name);
  const clients = invertPairs(
    combineInstantMetricsToPairs({
      processesPairs: pairsRx,
      metrics: metricsRx,
      prometheusKey: PrometheusLabelsV2.SourceComponentName,
      processPairsKey: 'sourceName'
    })
  );

  const servers = combineInstantMetricsToPairs({
    processesPairs: pairsTx,
    metrics: metricsTx,
    prometheusKey: PrometheusLabelsV2.DestComponentName,
    processPairsKey: 'destinationName'
  });

  const isEmpty = !servers.length && !clients.length;

  if (isEmpty) {
    return (
      <Card isFullHeight>
        <SKEmptyData icon={SearchIcon} />
      </Card>
    );
  }

  return (
    <Flex direction={{ default: 'column' }}>
      {renderTable(ComponentLabels.Clients, clients, PairsListColumns)}
      {renderTable(ComponentLabels.Servers, servers, PairsListColumns)}
    </Flex>
  );
};

export default PairsList;

const renderTable = (
  title: string,
  rows: PairsWithInstantMetrics[],
  columns: SKTableColumn<PairsWithInstantMetrics>[]
) =>
  !!rows.length && (
    <SkTable
      alwaysShowPagination={false}
      title={title}
      columns={columns}
      rows={rows}
      pagination={true}
      paginationPageSize={SMALL_PAGINATION_SIZE}
      customCells={CustomComponentPairCells}
    />
  );
