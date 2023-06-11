import { KeyboardEvent, MouseEvent as ReactMouseEvent, useCallback, useState } from 'react';

import { Card, CardTitle, Flex, Pagination, Text, TextContent, TextVariants, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon, SearchIcon } from '@patternfly/react-icons';
import {
  SortByDirection,
  TableComposable,
  TableText,
  Tbody,
  Td,
  Th,
  Thead,
  ThProps,
  Tr
} from '@patternfly/react-table';

import { getValueFromNestedProperty } from '@core/utils/getValueFromNestedProperty';

import { NonNullableValue, SKTableProps } from './SkTable.interface';
import EmptyData from '../EmptyData';

const FIRST_PAGE_NUMBER = 1;
const PAGINATION_PAGE_SIZE = 10;
const NO_RESULT_FOUND_LABEL = 'No results found';

const SkTable = function <T>({
  title,
  titleDescription,
  columns,
  rows = [],
  customCells,
  onGetFilters,
  pagination = false,
  paginationPageSize = PAGINATION_PAGE_SIZE,
  paginationTotalRows = rows.length,
  ...props
}: SKTableProps<T>) {
  const [activeSortIndex, setActiveSortIndex] = useState<number>();
  const [activeSortDirection, setActiveSortDirection] = useState<SortByDirection>();
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(FIRST_PAGE_NUMBER);
  const [paginationSize, setPaginationSize] = useState<number>(paginationPageSize);

  const skColumns = columns.filter(({ show }) => show !== false);

  const getSortParams = useCallback(
    (columnIndex: number): ThProps['sort'] => ({
      sortBy: {
        index: activeSortIndex,
        direction: activeSortDirection
      },
      onSort: (_event: ReactMouseEvent, index: number, direction: SortByDirection) => {
        if (onGetFilters) {
          onGetFilters({
            limit: paginationSize,
            offset: (currentPageNumber - 1) * paginationSize,
            sortName: index !== undefined && skColumns[index].prop,
            sortDirection: direction
          });
        }

        setActiveSortIndex(index);
        setActiveSortDirection(direction);
      },
      columnIndex
    }),
    [activeSortDirection, activeSortIndex, skColumns, currentPageNumber, paginationSize, onGetFilters]
  );

  const handleSetPageNumber = useCallback(
    (_: ReactMouseEvent | KeyboardEvent | MouseEvent, pageNumber: number) => {
      setCurrentPageNumber(pageNumber);

      if (onGetFilters) {
        onGetFilters({
          limit: paginationSize,
          offset: (pageNumber - 1) * paginationSize,
          sortName: activeSortIndex !== undefined && skColumns[activeSortIndex].prop,
          sortDirection: activeSortDirection
        });
      }
    },
    [activeSortDirection, activeSortIndex, skColumns, onGetFilters, paginationSize]
  );

  const handleSetPaginationSize = useCallback(
    (_: ReactMouseEvent | KeyboardEvent | MouseEvent, pageSizeSelected: number, newPage: number) => {
      setPaginationSize(pageSizeSelected);
      setCurrentPageNumber(FIRST_PAGE_NUMBER);

      if (onGetFilters) {
        onGetFilters({
          limit: pageSizeSelected,
          offset: (newPage - 1) * pageSizeSelected,
          sortName: activeSortIndex !== undefined && skColumns[activeSortIndex].prop,
          sortDirection: activeSortDirection
        });
      }
    },
    [activeSortDirection, activeSortIndex, skColumns, onGetFilters]
  );

  let sortedRows = rows;

  // enable the local sort and local pagination in case the onGetFilters is not defined
  if (!onGetFilters) {
    // Get the name of the currently active sort column, if any.
    const activeSortColumnName = skColumns[activeSortIndex || 0].prop;

    if (activeSortColumnName) {
      // Sort the rows array based on the values of the currently active sort column and direction.
      const sortDirectionMultiplier = activeSortDirection === SortByDirection.desc ? -1 : 1;
      sortedRows = sortRowsByColumnName(rows, activeSortColumnName as string, sortDirectionMultiplier);
    }

    if (pagination) {
      sortedRows = sortedRows.slice(
        (currentPageNumber - 1) * paginationSize,
        (currentPageNumber - 1) * paginationSize + paginationSize
      );
    }
  }

  const skRows = sortedRows.map((row, index) => ({
    id: index,
    columns: skColumns.map((column) => {
      const { prop } = column;
      const value = prop ? getValueFromNestedProperty(row, (prop as string).split('.') as (keyof T)[]) : '';

      return {
        ...column,
        data: row,
        value
      };
    })
  }));

  const { isPlain = false, shouldSort = true, ...restProps } = props;

  return (
    <Card isPlain={isPlain} isFullHeight>
      {title && (
        <CardTitle>
          <Flex>
            {title && (
              <TextContent>
                <Text component={TextVariants.h2}>{title}</Text>
              </TextContent>
            )}
            {titleDescription && (
              <Tooltip position="right" content={titleDescription}>
                <OutlinedQuestionCircleIcon />
              </Tooltip>
            )}
          </Flex>
        </CardTitle>
      )}
      <TableComposable borders={false} variant="compact" isStickyHeader isStriped {...restProps}>
        <Thead>
          <Tr>
            {skColumns.map(({ name, prop, columnDescription }, index) => (
              <Th
                colSpan={1}
                key={name}
                sort={(prop && shouldSort && getSortParams(index)) || undefined}
                info={
                  columnDescription
                    ? {
                        tooltip: columnDescription,
                        className: 'repositories-info-tip',
                        tooltipProps: {
                          isContentLeftAligned: true
                        }
                      }
                    : undefined
                }
              >
                {name}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {skRows.length === 0 && (
            <Tr>
              <Td colSpan={12}>
                <EmptyData message={NO_RESULT_FOUND_LABEL} icon={SearchIcon} />
              </Td>
            </Tr>
          )}
          {!(skRows.length === 0) &&
            skRows.map((row, rowIndex) => {
              const isOddRow = (rowIndex + 1) % 2;
              const customStyle = {
                backgroundColor: 'var(--pf-global--palette--blue-50)'
              };

              return (
                <Tr key={row.id} style={isOddRow ? customStyle : {}}>
                  {row.columns.map(({ data, value, customCellName, callback, format, width, modifier }, index) => {
                    const Component = !!customCells && !!customCellName && customCells[customCellName];

                    return (
                      <Td width={width} key={index} modifier={modifier}>
                        {Component && (
                          <Component data={data} value={value} callback={callback} format={format && format(value)} />
                        )}
                        {!Component && (
                          <TableText wrapModifier="truncate">{(format && format(value)) || value}</TableText>
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
        </Tbody>
      </TableComposable>
      {pagination && paginationTotalRows > paginationPageSize && (
        <Pagination
          className="pf-u-my-xs"
          perPageComponent="button"
          itemCount={paginationTotalRows}
          perPage={paginationSize}
          page={currentPageNumber}
          onSetPage={handleSetPageNumber}
          onPerPageSelect={handleSetPaginationSize}
        />
      )}
    </Card>
  );
};

export default SkTable;

function sortRowsByColumnName<T>(rows: NonNullableValue<T>[], columnName: string, direction: number) {
  return rows.sort((a, b) => {
    // Get the values of the sort column for the two rows being compared, and handle null values.
    const paramA = getValueFromNestedProperty(a, columnName.split('.') as (keyof T)[]);
    const paramB = getValueFromNestedProperty(b, columnName.split('.') as (keyof T)[]);

    if (paramA == null || paramB == null || paramA === paramB) {
      return 0;
    }

    return paramA > paramB ? direction : -direction;
  });
}
