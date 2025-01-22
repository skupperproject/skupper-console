import { FC, Fragment } from 'react';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Label,
  Split,
  SplitItem,
  Stack,
  StackItem
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import { DEFAULT_COMPLEX_STRING_SEPARATOR } from '../../../config/app';
import { Labels } from '../../../config/labels';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import ResourceIcon from '../../../core/components/ResourceIcon';
import { ellipsisInTheMiddle } from '../../../core/utils/EllipsisInTheMiddle';
import { formatByteRate, formatBytes } from '../../../core/utils/formatBytes';
import { ProcessResponse } from '../../../types/REST.interfaces';
import { TopologyMetrics } from '../../../types/Topology.interfaces';
import { ComponentRoutesPaths } from '../../Components/Components.enum';
import { ProcessesRoutesPaths } from '../../Processes/Processes.enum';
import { ServicesRoutesPaths } from '../../Services/Services.enum';
import { SitesRoutesPaths } from '../../Sites/Sites.enum';

type Totals = {
  totalBytesIn: Record<string, number>;
  totalBytesOut: Record<string, number>;
  totalByteRateIn: Record<string, number>;
  totalByteRateOut: Record<string, number>;
};

const NodeDetails: FC<{ data: ProcessResponse[]; metrics: TopologyMetrics }> = function ({ data, metrics }) {
  const names = data.map((itemSelected) => itemSelected.name);

  const initialTotals: Totals = {
    totalBytesIn: {},
    totalBytesOut: {},
    totalByteRateIn: {},
    totalByteRateOut: {}
  };

  const bytes = metrics?.sourceToDestBytes.reduce((acc, { metric, value }) => {
    if (names.includes(metric[PrometheusLabelsV2.SourceProcessName])) {
      acc.totalBytesOut[metric[PrometheusLabelsV2.SourceProcessName]] =
        (acc.totalBytesOut[metric[PrometheusLabelsV2.SourceProcessName]] || 0) + Number(value[1]);
    }

    if (names.includes(metric[PrometheusLabelsV2.DestProcessName])) {
      acc.totalBytesIn[metric[PrometheusLabelsV2.DestProcessName]] =
        (acc.totalBytesIn[metric[PrometheusLabelsV2.DestProcessName]] || 0) + Number(value[1]);
    }

    return acc;
  }, initialTotals);

  const byteRate = metrics?.sourceToDestByteRate.reduce((acc, { metric, value }) => {
    if (names.includes(metric[PrometheusLabelsV2.SourceProcessName])) {
      acc.totalByteRateOut[metric[PrometheusLabelsV2.SourceProcessName]] =
        (acc.totalByteRateOut[metric[PrometheusLabelsV2.SourceProcessName]] || 0) + Number(value[1]);
    }

    if (names.includes(metric[PrometheusLabelsV2.DestProcessName])) {
      acc.totalByteRateIn[metric[PrometheusLabelsV2.DestProcessName]] =
        (acc.totalByteRateIn[metric[PrometheusLabelsV2.DestProcessName]] || 0) + Number(value[1]);
    }

    return acc;
  }, initialTotals);

  const byteRateInValues = Object.values(byteRate.totalByteRateIn);
  const byteRateOutValues = Object.values(byteRate.totalByteRateOut);

  const totalBytesInSum = Object.values(bytes.totalBytesIn).reduce((acc, val) => acc + val, 0);
  const totalBytesOutSum = Object.values(bytes.totalBytesOut).reduce((acc, val) => acc + val, 0);
  const totalByteRateInSum = byteRateInValues.reduce((acc, val) => acc + val, 0);
  const totalByteRateOutSum = byteRateOutValues.reduce((acc, val) => acc + val, 0);

  const avgByteRateInSum = totalByteRateInSum / (byteRateInValues.length || 1);
  const avgByteRateOutSum = totalByteRateOutSum / (byteRateOutValues.length || 1);

  return (
    <>
      <Card isPlain>
        <CardHeader>
          <CardTitle>{Labels.Summary}</CardTitle>
        </CardHeader>
        <CardBody>
          <Table borders={false} variant="compact">
            <Thead noWrap>
              <Tr>
                <Th aria-label="metric" />
                <Th>{Labels.BytesIn}</Th>
                <Th>{Labels.BytesOut}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <b>{Labels.ByteRate}</b>
                </Td>
                <Td>{formatByteRate(totalByteRateInSum)}</Td>
                <Td>{formatByteRate(totalByteRateOutSum)}</Td>
              </Tr>

              <Tr>
                <Td>
                  <b>Avg. {Labels.ByteRate}</b>
                </Td>
                <Td>{formatByteRate(avgByteRateInSum)}</Td>
                <Td>{formatByteRate(avgByteRateOutSum)}</Td>
              </Tr>

              <Tr>
                <Td>
                  <b>{Labels.Bytes}</b>
                </Td>
                <Td>{formatBytes(totalBytesInSum)}</Td>
                <Td>{formatBytes(totalBytesOutSum)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <Card isPlain>
        <CardBody>
          <Stack hasGutter>
            {data.map((itemSelected) => {
              const goToLink = `${ProcessesRoutesPaths.Processes}/${itemSelected.name}@${itemSelected.identity}`;

              return (
                <StackItem key={itemSelected.identity}>
                  <Card>
                    <CardHeader>
                      <Flex>
                        <FlexItem>
                          <CardTitle title={itemSelected.name}>
                            <ResourceIcon type="process" />
                            {ellipsisInTheMiddle(itemSelected.name, { rightPartLength: 10 })}
                          </CardTitle>
                        </FlexItem>
                        <FlexItem>
                          <Label variant="outline" color="teal">
                            {itemSelected.processBinding}
                          </Label>
                        </FlexItem>
                      </Flex>
                    </CardHeader>

                    <CardBody>
                      <Table borders={false} variant="compact">
                        <Thead noWrap>
                          <Tr>
                            <Th aria-label="metric" />
                            <Th>{Labels.BytesIn}</Th>
                            <Th>{Labels.BytesOut}</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Th>
                              <b>{Labels.ByteRate}</b>
                            </Th>
                            <Td>{formatBytes(byteRate?.totalByteRateIn[itemSelected.name] || 0)}</Td>
                            <Td>{formatBytes(byteRate?.totalByteRateOut[itemSelected.name] || 0)}</Td>
                          </Tr>
                          <Tr>
                            <Th>
                              <b>{Labels.Bytes}</b>
                            </Th>
                            <Td>{formatBytes(bytes?.totalBytesIn[itemSelected.name] || 0)}</Td>
                            <Td>{formatBytes(bytes?.totalBytesOut[itemSelected.name] || 0)}</Td>
                          </Tr>
                        </Tbody>
                      </Table>

                      <DescriptionList>
                        <DescriptionListGroup />
                        <DescriptionListGroup>
                          <DescriptionListTerm>Resources</DescriptionListTerm>

                          <DescriptionListDescription>
                            <Flex direction={{ default: 'column' }}>
                              <FlexItem>
                                <ResourceIcon type="site" />
                                <Link
                                  to={`${SitesRoutesPaths.Sites}/${itemSelected.parentName}@${itemSelected.parent}`}
                                >
                                  {itemSelected.parentName}
                                </Link>
                              </FlexItem>

                              <FlexItem>
                                <ResourceIcon type="component" />
                                <Link
                                  to={`${ComponentRoutesPaths.Components}/${itemSelected.componentName}@${itemSelected.componentId}`}
                                >
                                  {itemSelected.componentName}
                                </Link>
                              </FlexItem>

                              <FlexItem>
                                {itemSelected?.services?.map((service) => (
                                  <Fragment key={service}>
                                    <ResourceIcon type="service" />
                                    <Link to={`${ServicesRoutesPaths.Services}/${service}`}>
                                      {service.split(DEFAULT_COMPLEX_STRING_SEPARATOR)[0]}
                                    </Link>
                                  </Fragment>
                                ))}
                              </FlexItem>
                            </Flex>
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </CardBody>

                    <Divider />

                    <CardFooter>
                      <Split hasGutter>
                        <SplitItem>
                          <Link to={`${goToLink}?type=${Labels.Details}`}>{Labels.ViewDetails}</Link>
                        </SplitItem>

                        <SplitItem>
                          <Link to={`${goToLink}?type=${Labels.Pairs}`}>{Labels.ViewFlows}</Link>
                        </SplitItem>

                        <SplitItem>
                          <Link to={`${goToLink}?type=${Labels.Overview}`}>{Labels.ViewMetrics}</Link>
                        </SplitItem>
                      </Split>
                    </CardFooter>
                  </Card>
                </StackItem>
              );
            })}
          </Stack>
        </CardBody>
      </Card>
    </>
  );
};

export default NodeDetails;
