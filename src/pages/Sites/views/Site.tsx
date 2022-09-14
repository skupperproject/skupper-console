import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardBody,
    CardTitle,
    List,
    ListItem,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Title,
} from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import DescriptionItem from '../../../core/components/DescriptionItem';
import SitesServices from '../services';
import { QueriesSites } from '../services/services.enum';
import {
    SitesRoutesPaths,
    SitesRoutesPathLabel,
    ProcessesTableColumns,
    SiteDetails,
} from '../Sites.enum';

const Site = function () {
    const navigate = useNavigate();
    const { id: siteId } = useParams() as { id: string };
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesSites.GetSite, siteId],
        () => SitesServices.getSite(siteId),
        {
            refetchInterval,
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

    if (isLoadingSite) {
        return <LoadingPage />;
    }

    if (!site) {
        return null;
    }

    const { processes, linkedSites, name, nameSpace } = site;

    return (
        <Stack hasGutter className="pf-u-pl-md">
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={SitesRoutesPaths.Sites}>{SitesRoutesPathLabel.Sites}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{name}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <StackItem>
                <Title headingLevel="h1">
                    <ResourceIcon type="site" />
                    {name}
                </Title>
            </StackItem>

            <StackItem>
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50">
                        <Card isFullHeight>
                            <CardTitle>
                                <Title headingLevel="h2">Details</Title>
                            </CardTitle>
                            <CardBody>
                                <DescriptionItem title={SiteDetails.Name} value={name} />
                                <DescriptionItem title={SiteDetails.Namespace} value={nameSpace} />
                            </CardBody>
                        </Card>
                    </SplitItem>

                    <SplitItem className="pf-u-w-50">
                        <Card isFullHeight style={{ height: '500px', overflow: 'auto' }}>
                            <CardTitle>
                                <Title headingLevel="h2">Processes</Title>
                            </CardTitle>
                            <CardBody>
                                <TableComposable variant="compact" borders={false}>
                                    <Thead>
                                        <Tr>
                                            <Th>{ProcessesTableColumns.Name}</Th>
                                            <Th>{ProcessesTableColumns.SourceHost}</Th>
                                        </Tr>
                                    </Thead>
                                    {processes?.map(
                                        ({ identity, name: processName, sourceHost }) => (
                                            <Tbody key={`${identity}${name}`}>
                                                <Tr>
                                                    <Td>{processName}</Td>
                                                    <Td>{sourceHost}</Td>
                                                </Tr>
                                            </Tbody>
                                        ),
                                    )}
                                </TableComposable>
                            </CardBody>
                        </Card>
                    </SplitItem>
                </Split>
            </StackItem>
            {!!linkedSites.length && (
                <StackItem>
                    <Card isFullHeight>
                        <CardTitle>
                            <Title headingLevel="h2">Linked to sites</Title>
                        </CardTitle>
                        <CardBody>
                            <List>
                                {linkedSites.map(({ identity, name: linkedSiteName }) => (
                                    <ListItem key={identity}>{linkedSiteName}</ListItem>
                                ))}
                            </List>
                        </CardBody>
                    </Card>
                </StackItem>
            )}
        </Stack>
    );
};

export default Site;
