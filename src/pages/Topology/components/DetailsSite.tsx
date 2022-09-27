import React, { FC, useState } from 'react';

import { Grid, GridItem, Label, Spinner } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import SitesController from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { ProcessesTableColumns } from '@pages/Sites/Sites.enum';
import { UPDATE_INTERVAL } from 'config';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import TopologyDetails from './Details';

const SPINNER_DIAMETER = 80;
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
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: traffic, isLoading: isLoadingTraffic } = useQuery(
        [QueriesTopology.GetSiteMetrics, id],
        () => TopologyController.getSiteMetrics(id),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesSites.GetProcessesBySiteId, id],
        () => SitesController.getProcessesBySiteId(id),
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

    if (isLoadingSite || isLoadingTraffic || isLoadingProcesses) {
        return (
            <Spinner
                diameter={`${SPINNER_DIAMETER}px`}
                style={{
                    position: 'absolute',
                    left: '50%',
                    marginLeft: `-${SPINNER_DIAMETER / 4}px`,
                    top: '50%',
                    marginTop: `-${SPINNER_DIAMETER / 4}px`,
                }}
            />
        );
    }

    if (!site || !traffic || !processes) {
        return null;
    }

    const { tcpConnectionsIn, tcpConnectionsOut } = traffic;

    const title = `${capitalizeFirstLetter(site.name)}`;

    return (
        <Grid hasGutter>
            <GridItem span={12}>
                <TopologyDetails
                    name={title}
                    tcpConnectionsInEntries={tcpConnectionsIn}
                    tcpConnectionsOutEntries={tcpConnectionsOut}
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
                                <Td>{name}</Td>
                                <Td>{sourceHost}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </TableComposable>
            </GridItem>
        </Grid>
    );
};

export default TopologySiteDetails;
