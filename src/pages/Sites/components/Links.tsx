import { FC } from 'react';

import { Card, Stack, StackItem } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { SMALL_PAGINATION_SIZE } from '../../../config/config';
import SKEmptyData from '../../../core/components/SkEmptyData';
import SkTable from '../../../core/components/SkTable';
import { SiteResponse } from '../../../types/REST.interfaces';
import { useSiteLinksData } from '../hooks/useSiteLinksData';
import { customSiteCells, linksColumns, linksRemoteColumns } from '../Sites.constants';

interface PairsListProps {
  site: SiteResponse;
}

const Links: FC<PairsListProps> = function ({ site: { identity: id } }) {
  const { links, remoteLinks } = useSiteLinksData(id);

  const isEmpty = !links.length && !remoteLinks.length;

  if (isEmpty) {
    return (
      <Card isFullHeight>
        <SKEmptyData icon={SearchIcon} />
      </Card>
    );
  }

  return (
    <Stack hasGutter>
      {!!links.length && (
        <StackItem>
          <SkTable
            title="Links"
            columns={linksColumns}
            rows={links}
            pagination={true}
            alwaysShowPagination={false}
            paginationPageSize={SMALL_PAGINATION_SIZE}
            customCells={customSiteCells}
          />
        </StackItem>
      )}

      {!!remoteLinks.length && (
        <StackItem>
          <SkTable
            title="Remote links"
            columns={linksRemoteColumns}
            rows={remoteLinks}
            pagination={true}
            alwaysShowPagination={false}
            paginationPageSize={SMALL_PAGINATION_SIZE}
            customCells={customSiteCells}
          />
        </StackItem>
      )}
    </Stack>
  );
};

export default Links;
