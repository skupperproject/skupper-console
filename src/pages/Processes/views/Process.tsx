import React, { FC, useState } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardBody,
    CardTitle,
    Flex,
    Grid,
    GridItem,
    Text,
    TextContent,
    TextVariants,
    Title,
} from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import ResourceIcon from '@core/components/ResourceIcon';
import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import {
    TopologyRoutesPaths,
    TopologyURLFilters,
    TopologyViews,
} from '@pages/Topology/Topology.enum';
import { RESTApi } from 'API/REST';
import { FlowAggregatesResponse, ProcessResponse } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from 'config';

import ProcessDescription from '../components/ProcessDescription';
import ProcessesBytesChart from '../components/ProcessesBytesChart';
import { processesConnectedColumns } from '../Processes.constant';
import { ProcessesLabels, ProcessesRoutesPaths, ProcessPairsColumnsNames } from '../Processes.enum';
import { CurrentBytesInfoProps } from '../Processes.interfaces';
import { QueriesProcesses } from '../services/services.enum';

const ProcessesConnectedComponentsTable = {
    ProcessLinkCell: (props: LinkCellProps<FlowAggregatesResponse>) =>
        LinkCell({
            ...props,
            type: 'process',
            link: `${ProcessesRoutesPaths.Processes}/${props.data.destinationId}`,
        }),
    TotalBytesExchanged: (props: LinkCellProps<FlowAggregatesResponse>) =>
        formatBytes(props.data.sourceOctets + props.data.destinationOctets),
    AvgLatency: (props: LinkCellProps<FlowAggregatesResponse>) =>
        formatBytes((props.data.sourceAverageLatency + props.data.destinationAverageLatency) / 2),
};

const Process = function () {
    const navigate = useNavigate();
    const { id: processId } = useParams() as { id: string };
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: process, isLoading: isLoadingProcess } = useQuery(
        [QueriesProcesses.GetProcess, processId],
        () => RESTApi.fetchProcess(processId),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processesPairsTxData, isLoading: isLoadingProcessesPairsTxData } = useQuery(
        [QueriesProcesses.GetProcessPairsTx, processId],
        () =>
            RESTApi.fetchProcessesPairs({
                filter: `sourceId.${processId}`,
                timeRangeStart: 0,
            }),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processesPairsRxData, isLoading: isLoadingProcessesPairsRxData } = useQuery(
        [QueriesProcesses.GetProcessPairsRx, processId],
        () =>
            RESTApi.fetchProcessesPairs({
                filter: `destinationId.${processId}`,
                timeRangeStart: 0,
            }),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: addresses, isLoading: isLoadingAddressesByProcess } = useQuery(
        [QueriesProcesses.GetAddressesByProcessId, processId],
        () => RESTApi.fetchAddressesByProcess(processId),
        {
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    if (
        isLoadingProcess ||
        isLoadingAddressesByProcess ||
        isLoadingProcessesPairsTxData ||
        isLoadingProcessesPairsRxData
    ) {
        return <LoadingPage />;
    }

    if (!process || !processesPairsTxData || !processesPairsRxData || !addresses) {
        return null;
    }

    const { name, octetReceivedRate, octetsReceived, octetSentRate, octetsSent } =
        process as ProcessResponse;

    const processesPairsTx = processesPairsTxData;

    const processesPairsRxReverse =
        processesPairsRxData.map((processPairsData) => ({
            ...processPairsData,
            sourceId: processPairsData.destinationId,
            sourceName: processPairsData.destinationName,
            destinationName: processPairsData.sourceName,
            destinationId: processPairsData.sourceId,
            sourceOctets: processPairsData.destinationOctets,
            destinationOctets: processPairsData.sourceOctets,
            sourceAverageLatency: processPairsData.destinationAverageLatency,
            destinationAverageLatency: processPairsData.sourceAverageLatency,
        })) || [];

    const totalBytes = process.octetsSent + process.octetsReceived;

    const processTrafficChartData = totalBytes && [
        {
            x: `${ProcessesLabels.TrafficSent}: ${Math.round(
                (process.octetsSent / totalBytes) * 100,
            )}%`,
            y: process.octetsSent,
        },
        {
            x: `${ProcessesLabels.TrafficReceived}: ${Math.round(
                (process.octetsReceived / totalBytes) * 100,
            )}%`,
            y: process.octetsReceived,
        },
    ];

    return (
        <TransitionPage>
            <Grid hasGutter>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={ProcessesRoutesPaths.Processes}>{ProcessesLabels.Section}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{name}</BreadcrumbHeading>
                </Breadcrumb>

                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <ResourceIcon type="process" />
                    <Title headingLevel="h1">{name}</Title>

                    <Link
                        to={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processId}`}
                    >
                        {`(${ProcessesLabels.GoToTopology})`}
                    </Link>
                </Flex>

                <GridItem>
                    <ProcessDescription process={process} title={ProcessesLabels.Details} />
                </GridItem>

                <GridItem span={8} rowSpan={3}>
                    <Card isFullHeight>
                        <CardTitle>{ProcessesLabels.TrafficInOutDistribution}</CardTitle>
                        {!processTrafficChartData && <EmptyData />}
                        {!!processTrafficChartData && (
                            <ProcessesBytesChart
                                bytes={processTrafficChartData}
                                themeColor={ChartThemeColor.multi}
                            />
                        )}
                    </Card>
                </GridItem>

                <GridItem span={4} rowSpan={2}>
                    <Card isFullHeight>
                        <CardTitle>{ProcessesLabels.TrafficTotal}</CardTitle>
                        <CardBody>
                            <TextContent>
                                <Text component={TextVariants.h1}>
                                    {formatBytes(octetsReceived + octetsSent)}
                                </Text>
                            </TextContent>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem span={2}>
                    <Card isFullHeight>
                        <CardTitle>{ProcessesLabels.TrafficSent}</CardTitle>
                        <CardBody>
                            <CurrentBytesInfo
                                direction="up"
                                style={{
                                    color: 'var(--pf-global--palette--blue-400)',
                                }}
                                byteRate={octetSentRate}
                                bytes={octetsSent}
                            />
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem span={2}>
                    <Card isFullHeight>
                        <CardTitle>{ProcessesLabels.TrafficReceived}</CardTitle>
                        <CardBody>
                            <CurrentBytesInfo
                                style={{
                                    color: 'var(--pf-global--palette--green-400)',
                                }}
                                byteRate={octetReceivedRate}
                                bytes={octetsReceived}
                            />
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem span={6}>
                    <SkTable
                        title={ProcessesLabels.Servers}
                        columns={processesConnectedColumns}
                        rows={processesPairsTx}
                        pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                        components={{
                            ...ProcessesConnectedComponentsTable,
                            viewDetailsLinkCell: (props: LinkCellProps<FlowAggregatesResponse>) =>
                                LinkCell({
                                    ...props,
                                    link: `${ProcessesRoutesPaths.Processes}/${process.identity}/${props.data.identity}`,
                                    value: ProcessPairsColumnsNames.ViewDetails,
                                }),
                        }}
                    />
                </GridItem>

                <GridItem span={6}>
                    <SkTable
                        title={ProcessesLabels.Clients}
                        columns={processesConnectedColumns}
                        rows={processesPairsRxReverse}
                        pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                        components={{
                            ...ProcessesConnectedComponentsTable,
                            viewDetailsLinkCell: (props: LinkCellProps<FlowAggregatesResponse>) =>
                                LinkCell({
                                    ...props,
                                    link: `${ProcessesRoutesPaths.Processes}/${processId}/${props.data.identity}`,
                                    value: ProcessPairsColumnsNames.ViewDetails,
                                }),
                        }}
                    />
                </GridItem>
            </Grid>
        </TransitionPage>
    );
};

export default Process;

const CurrentBytesInfo: FC<CurrentBytesInfoProps> = function ({
    description,
    direction = 'down',
    byteRate,
    bytes,
    ...props
}) {
    const { style } = props;

    return (
        <TextContent className="pf-u-color-300">
            {description}
            <Flex>
                <Text style={style} component={TextVariants.h1}>
                    {formatBytes(bytes)}
                </Text>

                <Text component={TextVariants.h1}>
                    {direction === 'up' ? (
                        <LongArrowAltUpIcon className="pf-u-ml-md" />
                    ) : (
                        <LongArrowAltDownIcon className="pf-u-ml-md" />
                    )}
                    {formatByteRate(byteRate)}
                </Text>
            </Flex>
        </TextContent>
    );
};
