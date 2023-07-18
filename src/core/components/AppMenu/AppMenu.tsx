import { Breadcrumb, BreadcrumbHeading, BreadcrumbItem, PageBreadcrumb } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

import { getTestsIds } from '@config/testIds.config';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';

const AppMenu = function () {
  const { pathname } = useLocation();

  const paths = pathname.split('/').filter(Boolean);
  const pathsNormalized = paths.map((path) => getIdAndNameFromUrlParams(path.replace(/%20/g, ' '))); //sanitize %20 url space
  const lastPath = pathsNormalized.pop();

  if (paths.length < 2) {
    return null;
  }

  return (
    <PageBreadcrumb>
      <Breadcrumb data-testid={getTestsIds.breadcrumbComponent()}>
        {pathsNormalized.map((path, index) => (
          <BreadcrumbItem key={path.name}>
            <Link to={[...paths].slice(0, index + 1).join('/')}>{path.name}</Link>
          </BreadcrumbItem>
        ))}
        <BreadcrumbHeading>{lastPath?.name}</BreadcrumbHeading>
      </Breadcrumb>
    </PageBreadcrumb>
  );
};

export default AppMenu;
