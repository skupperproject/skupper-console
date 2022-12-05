import React, { FC, useState } from 'react';

import {
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Grid,
    GridItem,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkSpinner from '@core/components/SkSpinner';
import SkTable from '@core/components/SkTable';
import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import SitesController from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { ProcessesTableColumns, SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { ProcessResponse } from 'API/REST.interfaces';
import { UPDATE_INTERVAL } from 'config';

import { QueriesTopology } from '../services/services.enum';
import { ConnectionsLabels } from '../Topology.enum';
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

    const columns = [
        {
            name: ProcessesTableColumns.Name,
            prop: 'name' as keyof ProcessResponse,
            component: 'ProcessNameLinkCell',
            width: 60,
        },
        {
            name: ProcessesTableColumns.SourceHost,
            prop: 'sourceHost' as keyof ProcessResponse,
        },
    ];

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
                <DescriptionList>
                    <DescriptionListGroup>
                        <DescriptionListTerm>{ConnectionsLabels.Processes}</DescriptionListTerm>
                    </DescriptionListGroup>
                </DescriptionList>
                <DescriptionListDescription>
                    <SkTable
                        borders={false}
                        isStriped={false}
                        isPlain={true}
                        shouldSort={false}
                        columns={columns}
                        rows={processes}
                        components={{
                            ProcessNameLinkCell: (props: LinkCellProps<ProcessResponse>) =>
                                LinkCell({
                                    ...props,
                                    type: 'process',
                                    link: `${ProcessesRoutesPaths.Processes}/${props.data.identity}`,
                                }),
                        }}
                    />
                </DescriptionListDescription>
            </GridItem>
        </Grid>
    );
};

export default TopologySiteDetails;
