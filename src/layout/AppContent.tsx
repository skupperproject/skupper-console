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

  return (
    <div className="pf-u-px-md pf-u-py-md" style={{ height: '100%' }}>
      <div style={{ position: 'relative', height: '100%' }}>
        <AnimatePresence mode="wait">{appRoutes}</AnimatePresence>
      </div>
    </div>
  );
};

export default AppContent;
