import React, { FC, useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardBody,
    CardTitle,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
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

import RealTimeLineChart from '@core/components/RealTimeLineChart';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import SitesController from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { ProcessResponse, SiteResponse } from 'API/REST.interfaces';
import { UPDATE_INTERVAL } from 'config';

import { ProcessesLabels, ProcessesRoutesPaths } from '../Processes.enum';
import { CurrentBytesInfoProps } from '../Processes.interfaces';
import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const Process = function () {
    const navigate = useNavigate();
    const { id: processId } = useParams() as { id: string };
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL / 2);

    const { data: process, isLoading: isLoadingProcess } = useQuery(
        [QueriesProcesses.GetProcess, processId],
        () => ProcessesController.getProcess(processId),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesSites.GetSite, process?.parent],
        () => SitesController.getSite(process?.parent || ''),
        {
            enabled: !!process?.parent,
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

    if (isLoadingProcess || isLoadingSite) {
        return <LoadingPage />;
    }

    const {
        name,
        imageName,
        group,
        groupIdentity,
        sourceHost,
        hostName,
        octetReceivedRate,
        octetsReceived,
        octetSentRate,
        octetsSent,
    } = process as ProcessResponse;
    const { identity: siteIdentity, name: siteName } = site as SiteResponse;

    return (
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
            </Flex>

            <GridItem span={12}>
                <Card isFullHeight isRounded>
                    <CardTitle>
                        <Title headingLevel="h2">{ProcessesLabels.Details}</Title>
                    </CardTitle>
                    <CardBody>
                        <DescriptionList>
                            <Grid hasGutter>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.Site}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            <ResourceIcon type="site" />
                                            <Link to={`${SitesRoutesPaths.Sites}/${siteIdentity}`}>
                                                {siteName}
                                            </Link>
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.ProcessGroup}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            <ResourceIcon type="service" />
                                            <Link
                                                to={`${ProcessGroupsRoutesPaths.ProcessGroups}/${groupIdentity}`}
                                            >
                                                {group}
                                            </Link>
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.Name}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            {name}
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.Image}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            {imageName}
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.SourceIP}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            {sourceHost}
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.Host}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            {hostName}
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                            </Grid>
                        </DescriptionList>
                    </CardBody>
                </Card>
            </GridItem>

            <GridItem>
                <Card>
                    <CardBody>
                        <Grid>
                            <GridItem span={6}>
                                <CurrentBytesInfo
                                    description={`${ProcessesLabels.CurrentBytesInfoByteRateOut}:`}
                                    direction="up"
                                    style={{
                                        color: 'var(--pf-global--palette--blue-400)',
                                    }}
                                    byteRate={octetSentRate}
                                    bytes={octetsSent}
                                />
                            </GridItem>
                            <GridItem span={6}>
                                <CurrentBytesInfo
                                    description={`${ProcessesLabels.CurrentBytesInfoByteRateIn}:`}
                                    style={{
                                        color: 'var(--pf-global--palette--red-100)',
                                    }}
                                    byteRate={octetReceivedRate}
                                    bytes={octetsReceived}
                                />
                            </GridItem>
                        </Grid>
                    </CardBody>
                </Card>
            </GridItem>

            <GridItem span={12}>
                <Card>
                    <RealTimeLineChart
                        data={[
                            {
                                name: ProcessesLabels.CurrentBytesInfoByteRateIn,
                                value: octetReceivedRate,
                            },
                            {
                                name: ProcessesLabels.CurrentBytesInfoByteRateOut,
                                value: octetSentRate,
                            },
                        ]}
                        options={{
                            formatter: formatByteRate,
                            colorScale: [
                                'var(--pf-global--palette--red-100)',
                                'var(--pf-global--palette--blue-400)',
                            ],
                            padding: {
                                left: 75,
                                right: 20,
                                top: 20,
                                bottom: 40,
                            },
                        }}
                    />
                </Card>
            </GridItem>
        </Grid>
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
        <DescriptionListGroup>
            <TextContent className="pf-u-color-300">
                <Flex>
                    {description}
                    <Text component={TextVariants.h1} style={style}>
                        {direction === 'up' ? (
                            <LongArrowAltUpIcon className="pf-u-ml-md" />
                        ) : (
                            <LongArrowAltDownIcon className="pf-u-ml-md" />
                        )}
                        {formatByteRate(byteRate)}
                    </Text>
                </Flex>
                <DescriptionListDescription>
                    <Text component={TextVariants.h1}>{formatBytes(bytes)}</Text>
                </DescriptionListDescription>
            </TextContent>
        </DescriptionListGroup>
    );
};
