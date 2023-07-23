import { AnimatePresence } from 'framer-motion';
import { useRoutes, RouteObject } from 'react-router-dom';

interface RouteProps {
  children: RouteObject[];
}

const RouteContainer = function ({ children: routes }: RouteProps) {
  const appRoutes = useRoutes([...routes, { path: '/', element: routes[0].element }]);

  if (!appRoutes) {
    return null;
  }

  return <AnimatePresence mode="wait">{appRoutes}</AnimatePresence>;
};

export default RouteContainer;
