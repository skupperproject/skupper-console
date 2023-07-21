import { AnimatePresence } from 'framer-motion';
import { useRoutes, RouteObject } from 'react-router-dom';

interface AppContentProps {
  children: RouteObject[];
}

const AppContent = function ({ children }: AppContentProps) {
  const appRoutes = useRoutes([...children, { path: '/', element: children[0].element }]);

  if (!appRoutes) {
    return null;
  }

  return <AnimatePresence mode="wait">{appRoutes}</AnimatePresence>;
};

export default AppContent;
