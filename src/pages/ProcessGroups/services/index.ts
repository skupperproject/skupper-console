import { formatBytes } from '@core/utils/formatBytes';
import { ProcessGroupResponse } from 'API/REST.interfaces';

const ProcessGroupsController = {
    formatProcessGroupsBytesForChart: (
        processes: ProcessGroupResponse[],
        property: keyof Pick<ProcessGroupResponse, 'octetsSent' | 'octetsReceived'>,
        count: number,
    ) => {
        const values = processes
            .sort((a, b) => b[property] - a[property])
            .slice(0, count)
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

export default ProcessGroupsController;
