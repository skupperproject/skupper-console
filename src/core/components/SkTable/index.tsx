import { KeyboardEvent, MouseEvent as ReactMouseEvent, useCallback, useRef, useState } from 'react';

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

import { DEFAULT_TABLE_PAGE_SIZE } from '@config/config';
import { getNestedProperty } from '@core/utils/getNestedProperties';

import { SKTableProps } from './SkTable.interface';
import EmptyData from '../EmptyData';

const FIRST_PAGE_NUMBER = 1;
const NO_RESULT_FOUND_LABEL = 'No results found';

const SkTable = function <T>({
  title,
  titleDescription,
  columns,
  rows = [],
  components,
  rowsCount = rows.length,
  onGetFilters, // if defined the local pagination/sort is disabled
  pageSizeStart, // if defined enable local pagination,
  ...props
}: SKTableProps<T>) {
  const [activeSortIndex, setActiveSortIndex] = useState<number>();
  const [activeSortDirection, setActiveSortDirection] = useState<SortByDirection>();
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(FIRST_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState<number>(
    onGetFilters ? rows.length : pageSizeStart || DEFAULT_TABLE_PAGE_SIZE
  );
  const pageSizeFirstLoadRef = useRef(onGetFilters ? rows.length : pageSizeStart || DEFAULT_TABLE_PAGE_SIZE);

  const getSortParams = useCallback(
    (columnIndex: number): ThProps['sort'] => ({
      sortBy: {
        index: activeSortIndex,
        direction: activeSortDirection
      },
      onSort: (_event: ReactMouseEvent, index: number, direction: SortByDirection) => {
        if (onGetFilters) {
          onGetFilters({
            limit: pageSize,
            offset: (currentPageNumber - 1) * pageSize,
            sortName: index !== undefined && columns[index].prop,
            sortDirection: direction
          });
        }

        setActiveSortIndex(index);
        setActiveSortDirection(direction);
      },
      columnIndex
    }),
    [activeSortDirection, activeSortIndex, columns, currentPageNumber, pageSize, onGetFilters]
  );

  function handleSetPageNumber(_: ReactMouseEvent | KeyboardEvent | MouseEvent, pageNumber: number) {
    setCurrentPageNumber(pageNumber);

    if (onGetFilters) {
      onGetFilters({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        sortName: activeSortIndex !== undefined && columns[activeSortIndex].prop,
        sortDirection: activeSortDirection
      });
    }
  }

  function handleSetPageSize(
    _: ReactMouseEvent | KeyboardEvent | MouseEvent,
    pageSizeSelected: number,
    newPage: number
  ) {
    setPageSize(pageSizeSelected);
    setCurrentPageNumber(FIRST_PAGE_NUMBER);

    if (onGetFilters) {
      onGetFilters({
        limit: pageSizeSelected,
        offset: (newPage - 1) * pageSizeSelected,
        sortName: activeSortIndex !== undefined && columns[activeSortIndex].prop,
        sortDirection: activeSortDirection
      });
    }
  }

  let rowsSorted = rows;

  // enable the local sort in case the onGetFilters is not defined
  if (!onGetFilters) {
    // Get the name of the currently active sort column, if any.
    const columnName = columns[activeSortIndex || 0].prop as string | undefined;
    const sortDirectionMultiplier = activeSortDirection === SortByDirection.desc ? -1 : 1;

    // Sort the rows array based on the values of the currently active sort column and direction.
    rowsSorted = rows.sort((a, b) => {
      if (!columnName) {
        return 0;
      }

      // Get the values of the sort column for the two rows being compared, and handle null values.
      const paramA = getNestedProperty(a, (columnName as string).split('.') as (keyof T)[]);
      const paramB = getNestedProperty(b, (columnName as string).split('.') as (keyof T)[]);

      if (paramA == null || paramB == null || paramA === paramB) {
        return 0;
      }

      return paramA > paramB ? sortDirectionMultiplier : -sortDirectionMultiplier;
    });
  }

  if (!!pageSizeStart && !onGetFilters) {
    rowsSorted = rowsSorted.slice((currentPageNumber - 1) * pageSize, (currentPageNumber - 1) * pageSize + pageSize);
  }

  const skRows = rowsSorted.map((row, index) => ({
    id: index,
    columns: columns.map((column) => {
      const { prop } = column;
      const value = prop ? getNestedProperty(row, (prop as string).split('.') as (keyof T)[]) : '';

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
            {columns.map(
              ({ name, prop, columnDescription, show = true }, index) =>
                show && (
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
                )
            )}
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
                  {row.columns.map(
                    ({ data, value, component, callback, format, width, modifier, show = true }, index) => {
                      if (!show) {
                        return null;
                      }

                      const Component = components && component && components[component];

                      return Component ? (
                        <Td width={width} key={index} modifier={modifier}>
                          <Component data={data} value={value} callback={callback} format={format && format(value)} />
                        </Td>
                      ) : (
                        <Td width={width} key={index} modifier={modifier}>
                          <TableText wrapModifier="truncate">
                            {(format && format(value)) || (value as string)}
                          </TableText>
                        </Td>
                      );
                    }
                  )}
                </Tr>
              );
            })}
        </Tbody>
      </TableComposable>
      {(!!pageSizeStart || !!onGetFilters) && rowsCount > pageSizeFirstLoadRef.current && (
        <Pagination
          className="pf-u-my-xs"
          perPageComponent="button"
          itemCount={rowsCount}
          perPage={pageSize}
          page={currentPageNumber}
          onSetPage={handleSetPageNumber}
          onPerPageSelect={handleSetPageSize}
        />
      )}
    </Card>
  );
};

export default SkTable;
