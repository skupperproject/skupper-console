import { formatBytes } from '@core/utils/formatBytes';
import { ProcessResponse } from 'API/REST.interfaces';

const ProcessesController = {
    getTop10processGroupsSentSortedByBytes: (processes: ProcessResponse[]) =>
        processes
            .sort((a, b) => b.octetsSent - a.octetsSent)
            .slice(0, 10)
            .map(({ name, octetsSent }) => ({
                x: name,
                y: octetsSent,
            }))
            .filter(({ y }) => y),

    getTop10processGroupsReceivedSortedByBytes: (processes: ProcessResponse[]) =>
        processes
            .sort((a, b) => b.octetsReceived - a.octetsReceived)
            .slice(0, 10)
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
