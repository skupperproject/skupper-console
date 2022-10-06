import { RESTApi } from 'API/REST';
import { ProcessResponse, SiteResponse } from 'API/REST.interfaces';

import { ProcessesExtended } from '../Processes.interfaces';

const ProcessesController = {
    getProcesses: async (): Promise<ProcessResponse[]> => RESTApi.fetchProcesses(),
    getProcess: async (id: string): Promise<ProcessResponse> => RESTApi.fetchProcess(id),

    getProcessesExtended: (
        sites: SiteResponse[],
        processes: ProcessResponse[],
    ): ProcessesExtended[] => {
        const siteNamesMap = sites?.reduce((acc, { identity, name }) => {
            acc[identity] = { siteName: name, siteIdentity: identity };

            return acc;
        }, {} as Record<string, { siteName: string; siteIdentity: string }>);

        return processes?.map((process) => {
            const { siteName, siteIdentity } = siteNamesMap[process.parent];

            return { ...process, siteIdentity, siteName };
        });
    },
};

export default ProcessesController;
