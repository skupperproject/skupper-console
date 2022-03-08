import React, { useCallback, useState } from 'react';

import {
  Brand,
  Nav,
  Page,
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
  PageSidebar,
  TextContent,
  Text,
  TextVariants,
  NavList,
  NavItem,
  NavProps
} from "@patternfly/react-core";

import './App.scss';

import Logo from './assets/skupper.svg';

const PageToolbar = (
  <PageHeaderTools>
    <PageHeaderToolsGroup>
      <PageHeaderToolsItem>
        <TextContent>
          <Text component={TextVariants.h4}>Site <span className="pf-u-font-weight-bold">Private 1</span></Text>
        </TextContent>
      </PageHeaderToolsItem>
    </PageHeaderToolsGroup>
  </PageHeaderTools>
);

const PageNav = () => {
  const [activeItemId, setActiveId] = useState(0);

  const handleSelect: NavProps['onSelect'] = useCallback(({ itemId }) => {
    setActiveId(itemId);
  }, []);

  return (
    <Nav onSelect={handleSelect}>
      <NavList>
        <NavItem id="default-link1" to="#default-link1" itemId={0} isActive={activeItemId === 0}>
          Overview
        </NavItem>
        <NavItem id="default-link2" to="#default-link2" itemId={1} isActive={activeItemId === 1}>
          Services
        </NavItem>
        <NavItem id="default-link3" to="#default-link3" itemId={2} isActive={activeItemId === 2}>
          Sites
        </NavItem>
        <NavItem id="default-link4" to="#default-link4" itemId={3} isActive={activeItemId === 3}>
          Deployment
        </NavItem>
        <NavItem id="default-link5" to="#default-link5" itemId={4} isActive={activeItemId === 4}>
          Monitoring
        </NavItem>
      </NavList>
    </Nav>
  );
};

const AppContent = () => {
  return (
    <div>test</div>
  );
};

function App() {
  return (
    <Page
      header={
        <PageHeader
          logo={
            <Brand
              src={Logo}
              alt="Logo"
              className='pf-u-w-100'
            />
          }
          headerTools={PageToolbar}
          showNavToggle
        />
      }
      sidebar={
        <PageSidebar
          nav={PageNav()}
          theme="dark"
        />
      }
      isManagedSidebar
    >
      <AppContent />
    </Page>
  );
}

export default App;
