import { PageSection } from '@patternfly/react-core';
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
    <PageSection padding={{ default: 'padding' }} style={{ height: '100%' }}>
      <AnimatePresence mode="wait">{appRoutes}</AnimatePresence>
    </PageSection>
  );
};

export default AppContent;
