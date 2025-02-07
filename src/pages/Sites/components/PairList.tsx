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
import { PairsWithInstantMetrics, SiteResponse } from '../../../types/REST.interfaces';
import { SKTableColumn } from '../../../types/SkTable.interfaces';
import { PairsListColumns } from '../../Processes/Processes.constants';
import { useSitePairsListData } from '../hooks/useSitePairsData';
import { CustomSitePairCells } from '../Sites.constants';

interface PairsListProps {
  site: SiteResponse;
}

const PairsList: FC<PairsListProps> = function ({ site: { identity: id } }) {
  const { pairsTx, pairsRx, metricsTx, metricsRx } = useSitePairsListData(id);

  const clients = invertPairs(
    combineInstantMetricsToPairs({
      processesPairs: pairsRx,
      metrics: metricsRx,
      prometheusKey: PrometheusLabelsV2.SourceSiteId,
      processPairsKey: 'sourceId'
    })
  );

  const servers = combineInstantMetricsToPairs({
    processesPairs: pairsTx,
    metrics: metricsTx,
    prometheusKey: PrometheusLabelsV2.DestSiteId,
    processPairsKey: 'destinationId'
  });

  const isEmpty = !servers.length && !clients.length;

  if (isEmpty) {
    return (
      <Card isFullHeight>
        <SKEmptyData icon={CubesIcon} message={Labels.NoLinkFound} description={Labels.NoLinkFoundDescription} />
      </Card>
    );
  }

  return (
    <Flex direction={{ default: 'column' }}>
      {renderTable(
        Labels.Clients,
        clients,
        setColumnVisibility(PairsListColumns, { protocol: false, observedApplicationProtocols: false })
      )}
      {renderTable(
        Labels.Servers,
        servers,
        setColumnVisibility(PairsListColumns, { protocol: false, observedApplicationProtocols: false })
      )}
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
      customCells={CustomSitePairCells}
    />
  );
