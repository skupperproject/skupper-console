import { apiEndpoints } from '../../src/config/api';
import { getTestsIds } from '../../src/config/testIds';
import { ComponentRoutesPaths } from '../../src/pages/Components/Components.enum';
import { ProcessesRoutesPaths } from '../../src/pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '../../src/pages/Sites/Sites.enum';

const sitesPath = `/#${SitesRoutesPaths.Sites}`;
const componentsPath = `/#${ComponentRoutesPaths.Components}`;
const processesPath = `/#${ProcessesRoutesPaths.Processes}`;

describe('Data Consistency Tests', () => {
  it('Should handle sites data and details correctly', () => {
    cy.intercept('GET', apiEndpoints.SITES).as('section');
    cy.visitWithAuth(sitesPath);

    cy.wait('@section').then((interception) => {
      const response = interception.response.body;

      if (!response.results || response.results.length === 0) {
        cy.log('No sites data available');
        expect(response.results).to.be.an('array');
        expect(response.count).to.equal(0);

        return;
      }

      const data = response.results[0];
      cy.visitWithAuth(`${sitesPath}/${data.name}@${data.identity}`);
      cy.get(`[data-testid=${getTestsIds.siteView(data.identity)}]`).should('be.visible');
    });
  });

  it('Should handle components data and details correctly', () => {
    cy.intercept('GET', `${apiEndpoints.COMPONENTS}*`).as('section');
    cy.visitWithAuth(componentsPath);

    cy.wait('@section').then((interception) => {
      const response = interception.response.body;

      if (!response.results || response.results.length === 0) {
        cy.log('No components data available');
        expect(response.results).to.be.an('array');
        expect(response.count).to.equal(0);

        return;
      }

      const data = response.results[0];
      cy.visitWithAuth(`${componentsPath}/${data.name}@${data.identity}`);
      cy.get(`[data-testid=${getTestsIds.componentView(data.identity)}]`).should('be.visible');
    });
  });

  it('Should handle processes data and details correctly', () => {
    cy.intercept('GET', `${apiEndpoints.PROCESSES}*`).as('section');
    cy.visitWithAuth(processesPath);

    cy.wait('@section').then((interception) => {
      const response = interception.response.body;

      if (!response.results || response.results.length === 0) {
        cy.log('No processes data available');
        expect(response.results).to.be.an('array');
        expect(response.count).to.equal(0);

        return;
      }

      const data = response.results[0];
      cy.visitWithAuth(`${processesPath}/${data.name}@${data.identity}`);
      cy.get(`[data-testid=${getTestsIds.processView(data.identity)}]`).should('be.visible');
    });
  });
});
