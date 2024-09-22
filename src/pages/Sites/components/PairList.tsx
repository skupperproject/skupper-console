import { FC } from 'react';

import { Card, Flex } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { SMALL_PAGINATION_SIZE } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import SKEmptyData from '@core/components/SkEmptyData';
import SkTable from '@core/components/SkTable';
import { CustomPairsCells } from '@pages/Processes/Processes.constants';
import { invertProcessPairsList } from '@pages/Processes/Processes.utls';
import { TopologyController } from '@pages/Topology/services';
import { PairsResponse, SiteResponse } from '@sk-types/REST.interfaces';
import { SKTableColumn } from '@sk-types/SkTable.interfaces';

import { useSitePairsListData } from '../hooks/useSitePairsData';
import { paisColumns } from '../Sites.constants';
import { SiteLabels } from '../Sites.enum';

interface PairsListProps {
  site: SiteResponse;
}

const PairsList: FC<PairsListProps> = function ({ site: { identity: id, name } }) {
  const { pairsTx, pairsRx, metricsTx, metricsRx } = useSitePairsListData(id, name);

  const clients = invertProcessPairsList(
    TopologyController.addMetricsToPairs({
      processesPairs: pairsRx,
      metrics: metricsRx,
      prometheusKey: PrometheusLabelsV2.SourceSiteName,
      processPairsKey: 'sourceName'
    })
  );

  const servers = TopologyController.addMetricsToPairs({
    processesPairs: pairsTx,
    metrics: metricsTx,
    prometheusKey: PrometheusLabelsV2.DestSiteName,
    processPairsKey: 'destinationName'
  });

  const renderTable = (title: string, rows: PairsResponse[], columns: SKTableColumn<PairsResponse>[]) =>
    !!rows.length && (
      <SkTable
        alwaysShowPagination={false}
        title={title}
        columns={columns}
        rows={rows}
        pagination={true}
        paginationPageSize={SMALL_PAGINATION_SIZE}
        customCells={CustomPairsCells}
      />
    );

  return (
    <>
      {!servers.length && !clients.length && (
        <Card isFullHeight>
          <SKEmptyData icon={SearchIcon} />
        </Card>
      )}

      <Flex direction={{ default: 'column' }}>
        {renderTable(SiteLabels.Clients, clients, paisColumns)}
        {renderTable(SiteLabels.Servers, servers, paisColumns)}
      </Flex>
    </>
  );
};

export default PairsList;
