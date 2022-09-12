import { Site } from './services/services.interfaces';

export interface SitesTableProps {
    sites: Site[];
}

export interface DescriptionItemProps {
    title: string;
    value: string;
}
