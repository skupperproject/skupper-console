import { getTestsIds } from '../../../../src/config/testIds';
import sitesData from '../../../../mocks/data/SITES.json';
import processesData from '../../../../mocks/data/PROCESSES.json';

const site = sitesData.results[0];
const sitePath = `#/sites/${encodeURIComponent(site.name)}@${encodeURIComponent(site.identity)}`;
const process = processesData.results[0];
const processPath = `#/processes/${process.name}@${process.identity}`;

context('Site Detail', () => {
  const testId = `${getTestsIds.siteView(site.identity)}`;

  beforeEach(() => {
    cy.visit(`${sitePath}?type=Details`);
  });

  it('should navigate to the Site section', () => {
    cy.get(`[data-testid="${testId}"]`).contains(site.name).should('have.length', 1);
    cy.get(`[data-testid="${testId}"]`).contains(site.nameSpace).should('have.length', 1);
  });

  it('should navigate to the correct site page when clicking on a link', () => {
    const expectedUrl = `http://localhost:3000/${sitePath}?type=Overview`;

    const link = cy.get(`[data-testid="${testId}"]`).contains('Overview');
    link.click();
    cy.url().should('eq', expectedUrl);
  });
});

context('Site Processes', () => {
  const testId = `${getTestsIds.siteView(site.identity)}`;

  beforeEach(() => {
    cy.visit(`${sitePath}?type=Processes`);
  });

  it('should navigate to the correct process page when clicking on a link', () => {
    const expectedUrl = 'http://localhost:3000/#/processes/process%20payment%201@process-payment-1?type=Overview';

    const link = cy.get(`[data-testid="${testId}"]`).contains(process.name);
    link.should('have.attr', 'href', `${processPath}`);
    link.click();
    cy.url().should('eq', expectedUrl);
  });
});
