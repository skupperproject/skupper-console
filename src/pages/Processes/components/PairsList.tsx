import { FC } from 'react';

import { Card, Flex } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

import { SMALL_PAGINATION_SIZE } from '../../../config/app';
import { Labels } from '../../../config/labels';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import SKEmptyData from '../../../core/components/SkEmptyData';
import SkTable from '../../../core/components/SkTable';
import { setColumnVisibility } from '../../../core/components/SkTable/SkTable.utils';
import { combineInstantMetricsToPairs } from '../../../core/utils/combineInstantMetricsToPairs';
import { invertPairs } from '../../../core/utils/invertPairs';
import { PairsWithInstantMetrics, ProcessResponse } from '../../../types/REST.interfaces';
import { SKTableColumn } from '../../../types/SkTable.interfaces';
import { useProcessPairsListData } from '../hooks/usePairsListData';
import { CustomProcessPairCells, PairsListColumnsWithLinkDetails } from '../Processes.constants';

interface PairsListProps {
  process: ProcessResponse;
}

const PairsList: FC<PairsListProps> = function ({ process: { identity: id, name } }) {
  const { pairsTx, pairsRx, metricsTx, metricsRx } = useProcessPairsListData(id, name);

  const clients = invertPairs(
    combineInstantMetricsToPairs({
      processesPairs: pairsRx,
      metrics: metricsRx,
      prometheusKey: PrometheusLabelsV2.SourceProcessName,
      processPairsKey: 'sourceName'
    })
  );

  const servers = combineInstantMetricsToPairs({
    processesPairs: pairsTx,
    metrics: metricsTx,
    prometheusKey: PrometheusLabelsV2.DestProcessName,
    processPairsKey: 'destinationName'
  });

  const isEmpty = !servers.length && !clients.length;

  if (isEmpty) {
    return (
      <Card isFullHeight>
        <SKEmptyData icon={CubesIcon} />
      </Card>
    );
  }

  return (
    <Flex direction={{ default: 'column' }}>
      {renderTable(Labels.Clients, clients, setColumnVisibility(PairsListColumnsWithLinkDetails))}
      {renderTable(Labels.Servers, servers, setColumnVisibility(PairsListColumnsWithLinkDetails))}
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
      customCells={CustomProcessPairCells}
    />
  );
