import { formatBytes } from '@core/utils/formatBytes';
import { ProcessResponse } from 'API/REST.interfaces';

const ProcessesController = {
    getTopProcessGroupsSentSortedByBytes: (processes: ProcessResponse[]) =>
        processes
            .map(({ name, octetsSent }) => ({
                x: name,
                y: octetsSent,
            }))
            .filter(({ y }) => y),

    getTopProcessGroupsReceivedSortedByBytes: (processes: ProcessResponse[]) =>
        processes
            .map(({ name, octetsReceived }) => ({
                x: name,
                y: octetsReceived,
            }))
            .filter(({ y }) => y),

    getBytesLabels: (bytes: { x: string; y: number }[]) =>
        bytes.map(({ x, y }) => ({
            name: `${x}: ${formatBytes(y)}`,
        })),
};

export default ProcessesController;
