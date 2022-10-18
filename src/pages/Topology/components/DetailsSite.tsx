import React, { FC, useState } from 'react';

import { Grid, GridItem, Label } from '@patternfly/react-core';
import { TableComposable, TableText, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import SkSpinner from '@core/components/SkSpinner';
import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import SitesController from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { ProcessesTableColumns, SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { UPDATE_INTERVAL } from 'config';

import { QueriesTopology } from '../services/services.enum';
import TopologyDetails from './Details';

interface TopologySiteDetailsProps {
    id: string;
}

const TopologySiteDetails: FC<TopologySiteDetailsProps> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesTopology.GetSite, id],
        () => SitesController.getSite(id),
        {
            cacheTime: 0,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesSites.GetProcessesBySiteId, id],
        () => SitesController.getActiveProcessesBySiteId(id),
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

    if (isLoadingSite || isLoadingProcesses) {
        return <SkSpinner />;
    }

    if (!site || !processes) {
        return null;
    }

    const title = `${capitalizeFirstLetter(site.name)}`;

    return (
        <Grid hasGutter>
            <GridItem span={12}>
                <TopologyDetails
                    name={title}
                    link={SitesRoutesPaths.Sites}
                    tcpConnectionsInEntries={[]}
                    tcpConnectionsOutEntries={[]}
                />
            </GridItem>
            <GridItem span={12}>
                <Label color="blue">{'Processes'}</Label>

                <TableComposable variant="compact" borders={false}>
                    <Thead>
                        <Tr>
                            <Th>{ProcessesTableColumns.Name}</Th>
                            <Th>{ProcessesTableColumns.SourceHost}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {processes?.map(({ identity, name, sourceHost }) => (
                            <Tr key={`${identity}${name}`}>
                                <Td>
                                    <Link to={`${ProcessesRoutesPaths.Processes}/${identity}`}>
                                        <TableText wrapModifier="truncate">{name} </TableText>
                                    </Link>
                                </Td>
                                <Td width={30}>{sourceHost}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </TableComposable>
            </GridItem>
        </Grid>
    );
};

export default TopologySiteDetails;
