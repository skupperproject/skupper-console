import { formatBytes } from '@core/utils/formatBytes';
import { ProcessResponse } from 'API/REST.interfaces';

const ProcessesController = {
    formatProcessesBytesForChart: (
        processes: ProcessResponse[],
        property: keyof Pick<ProcessResponse, 'octetsSent' | 'octetsReceived'>,
    ) => {
        const values = processes
            .map((process) => ({
                x: process.name,
                y: process[property],
            }))
            .filter(({ y }) => y);

        const labels = values.map(({ x, y }) => ({
            name: `${x}: ${formatBytes(y)}`,
        }));

        return { labels, values };
    },
};

export default ProcessesController;
