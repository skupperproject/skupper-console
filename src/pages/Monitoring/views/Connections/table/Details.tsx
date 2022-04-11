import React from 'react';

import {
  InnerScrollContainer,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

import { formatBytes } from '@utils/formatBytes';
import { formatTime } from '@utils/formatTime';

import { ConnectionColumns } from '../../../Monitoring.enum';
import { Connection } from '../../../Monitoring.interfaces';

const ConnectionDetailsTable = function ({
  connection,
  totalBytes,
  totalBytesIn,
  connectorName,
  listenerName,
}: {
  connection: Connection[];
  totalBytes: number;
  totalBytesIn: number;
  connectorName: string;
  listenerName: string;
}) {
  return (
    <InnerScrollContainer>
      <TableComposable
        isStickyHeader
        className="flows-table"
        aria-label="flows table"
        borders
        variant="compact"
        gridBreakPoint=""
      >
        <Thead hasNestedHeader>
          <Tr>
            <Th hasRightBorder>{ConnectionColumns.ConnectionStatus}</Th>
            <Th hasRightBorder colSpan={3}>
              {connectorName}
            </Th>

            <Th hasRightBorder colSpan={3}>
              {listenerName}
            </Th>
          </Tr>
          <Tr>
            <Th hasRightBorder />
            <Th hasRightBorder isSubheader>
              {ConnectionColumns.Traffic}
            </Th>
            <Th hasRightBorder width={10} isSubheader>
              {ConnectionColumns.TrafficPercentage}
            </Th>
            <Th hasRightBorder isSubheader>
              {ConnectionColumns.Latency}
            </Th>

            <Th hasRightBorder isSubheader>
              {ConnectionColumns.TrafficIn}
            </Th>
            <Th hasRightBorder isSubheader>
              {ConnectionColumns.TrafficPercentage}
            </Th>
            <Th hasRightBorder isSubheader>
              {ConnectionColumns.LatencyIn}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {connection.map(({ id, octets, latency, latencyIn, endTime, octetsIn }) => (
            <Tr key={id}>
              <Th hasRightBorder dataLabel={ConnectionColumns.ConnectionStatus}>
                {endTime ? 'Closed' : 'Open'}
              </Th>
              <Td className="pf-u-text-align-right" dataLabel={ConnectionColumns.Traffic}>
                {formatBytes(octets)}
              </Td>
              <Td
                modifier="fitContent"
                className="pf-u-text-align-right"
                dataLabel={ConnectionColumns.TrafficPercentage}
              >
                {((octetsIn / totalBytesIn) * 100).toFixed(1)}
              </Td>
              <Th
                hasRightBorder
                className="pf-u-text-align-right"
                dataLabel={ConnectionColumns.Latency}
              >
                {formatTime(latency)}
              </Th>

              <Td className="pf-u-text-align-right" dataLabel={ConnectionColumns.TrafficIn}>
                {formatBytes(octetsIn)}
              </Td>
              <Td
                modifier="fitContent"
                className="pf-u-text-align-right"
                dataLabel={ConnectionColumns.TrafficPercentage}
              >
                {((octets / totalBytes) * 100).toFixed(1)}
              </Td>
              <Td className="pf-u-text-align-right" dataLabel={ConnectionColumns.LatencyIn}>
                {formatTime(latencyIn)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </InnerScrollContainer>
  );
};

export default ConnectionDetailsTable;
