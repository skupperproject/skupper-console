import { Navigate } from 'react-router-dom';

import { DEFAULT_ROUTE } from '@config/routes';

const DefaultRoute = function () {
  return <Navigate to={DEFAULT_ROUTE} replace={true} />;
};

export default DefaultRoute;
