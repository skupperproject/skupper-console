import { Breadcrumb, BreadcrumbHeading, BreadcrumbItem } from '@patternfly/react-core';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { getTestsIds } from '../../../config/testIds';
import { getIdAndNameFromUrlParams } from '../../utils/getIdAndNameFromUrlParams';

const SkBreadcrumb = function () {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const paths = pathname.split('/').filter(Boolean);
  const pathsNormalized = paths.map((path) => getIdAndNameFromUrlParams(path.replace(/%20/g, ' '))); //sanitize %20 url space
  const lastPath = pathsNormalized.pop();

  if (paths.length < 2) {
    return null;
  }

  const queryParams = searchParams.size > 0 ? `?${searchParams.toString()}` : '';

  return (
    <Breadcrumb data-testid={getTestsIds.breadcrumbComponent()}>
      {pathsNormalized.map((path, index) => (
        <BreadcrumbItem key={path.name} style={{ textTransform: 'capitalize' }}>
          <Link to={`${[...paths].slice(0, index + 1).join('/')}${queryParams}`}>{path.name}</Link>
        </BreadcrumbItem>
      ))}

      <BreadcrumbHeading> &nbsp; {lastPath?.name}</BreadcrumbHeading>
    </Breadcrumb>
  );
};

export default SkBreadcrumb;
