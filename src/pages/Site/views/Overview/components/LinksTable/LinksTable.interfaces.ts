import { Links } from '@models/services/REST.interfaces';

export interface LinkRow {
  status: string;
  name: string;
  created: string;
}

export interface LinksTableProps {
  links: Links[];
}
