import { apiEndpoints } from '../../src/config/api';
import { getTestsIds } from '../../src/config/testIds';
import { ComponentRoutesPaths } from '../../src/pages/Components/Components.enum';
import { ProcessesRoutesPaths } from '../../src/pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '../../src/pages/Sites/Sites.enum';

const sitesPath = `/#${SitesRoutesPaths.Sites}`;
const componentsPath = `/#${ComponentRoutesPaths.Components}`;
const processesPath = `/#${ProcessesRoutesPaths.Processes}`;

describe('Data Consistency Tests', () => {
  it('Should maintain data consistency across sites and site detail', () => {
    let data;

    cy.intercept('GET', apiEndpoints.SITES).as('section');

    cy.visit(sitesPath);
    cy.wait('@section').then((interception) => {
      const response = interception.response.body;
      data = response.results[0];

      cy.visit(`${sitesPath}/${data.name}@${data.identity}`);
      cy.get(`[data-testid=${getTestsIds.siteView(data.identity)}]`).should('be.visible');
    });
  });

  it('Should maintain data consistency across components and component detail', () => {
    let data;

    cy.intercept('GET', `${apiEndpoints.COMPONENTS}*`).as('section');

    cy.visit(componentsPath);
    cy.wait('@section').then((interception) => {
      const response = interception.response.body;
      data = response.results[0];

      cy.visit(`${componentsPath}/${data.name}@${data.identity}`);
      cy.get(`[data-testid=${getTestsIds.componentView(data.identity)}]`).should('be.visible');
    });
  });

  it('Should maintain data consistency across processes and process detail', () => {
    let data;

    cy.intercept('GET', `${apiEndpoints.PROCESSES}*`).as('section');

    cy.visit(processesPath);
    cy.wait('@section').then((interception) => {
      const response = interception.response.body;
      data = response.results[0];

      cy.visit(`${processesPath}/${data.name}@${data.identity}`);
      cy.get(`[data-testid=${getTestsIds.processView(data.identity)}]`).should('be.visible');
    });
  });
});
