import { Link } from '@pages/Sites/services/services.interfaces';

export interface LinkRow {
  status: string;
  name: string;
  created: string;
}

export interface LinksTableProps {
  links: Link[];
}
