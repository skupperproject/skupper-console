import { Breadcrumb, BreadcrumbHeading, BreadcrumbItem } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

import { getTestsIds } from '@config/testIds.config';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';

const SkBreadcrumb = function () {
  const { pathname } = useLocation();

  const paths = pathname.split('/').filter(Boolean);
  const pathsNormalized = paths.map((path) => getIdAndNameFromUrlParams(path.replace(/%20/g, ' '))); //sanitize %20 url space
  const lastPath = pathsNormalized.pop();

  if (paths.length < 2) {
    return null;
  }

  return (
    <Breadcrumb data-testid={getTestsIds.breadcrumbComponent()}>
      {pathsNormalized.map((path, index) => (
        <BreadcrumbItem key={path.name} className="sk-capitalize">
          <Link to={[...paths].slice(0, index + 1).join('/')}>{path.name}</Link>
        </BreadcrumbItem>
      ))}

      <BreadcrumbHeading> &nbsp; {lastPath?.name}</BreadcrumbHeading>
    </Breadcrumb>
  );
};

export default SkBreadcrumb;
