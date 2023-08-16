import { MouseEvent as ReactMouseEvent, KeyboardEvent, FC } from 'react';

import { Pagination, Panel, PanelMain, PanelMainBody } from '@patternfly/react-core';

interface SkPaginationProps {
  isCompact?: boolean;
  totalRow: number;
  paginationSize: number;
  currentPageNumber: number;
  onSetPageNumber?: (event: ReactMouseEvent | KeyboardEvent | MouseEvent, pageNumber: number) => void;
  onSetPaginationSize?: (
    _: ReactMouseEvent | KeyboardEvent | MouseEvent,
    pageSizeSelected: number,
    newPage: number
  ) => void;
}

const SkPagination: FC<SkPaginationProps> = function ({
  isCompact = false,
  totalRow,
  paginationSize,
  currentPageNumber,
  onSetPageNumber,
  onSetPaginationSize
}) {
  return (
    <Panel>
      <PanelMain>
        <PanelMainBody>
          <Pagination
            isCompact={isCompact}
            itemCount={totalRow}
            perPage={paginationSize}
            page={currentPageNumber}
            onSetPage={onSetPageNumber}
            onPerPageSelect={onSetPaginationSize}
          />
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

export default SkPagination;
