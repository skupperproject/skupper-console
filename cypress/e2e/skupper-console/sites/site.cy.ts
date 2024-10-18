import { getTestsIds } from '../../../../src/config/testIds';

context('Site Detail', () => {
  const testId = `${getTestsIds.siteView('site-1')}`;

  beforeEach(() => {
    cy.visit('#/sites/site%201@site-1?type=Details');
  });

  it('should navigate to the Site section', () => {
    cy.get(`[data-testid="${testId}"]`).contains('site 1').should('have.length', 1);
    cy.get(`[data-testid="${testId}"]`).contains('config-grpc-site-1-test').should('have.length', 1);
  });

  it('should navigate to the correct site page when clicking on a link', () => {
    const expectedUrl = 'http://localhost:3000/#/sites/site%201@site-1?type=Overview';

    const link = cy.get(`[data-testid="${testId}"]`).contains('Overview');
    link.click();
    cy.url().should('eq', expectedUrl);
  });
});

context('Site Processes', () => {
  const testId = `${getTestsIds.siteView('site-1')}`;

  beforeEach(() => {
    cy.visit('#/sites/site%201@site-1?type=Processes');
  });

  it('should navigate to the correct process page when clicking on a link', () => {
    const expectedUrl = 'http://localhost:3000/#/processes/process%20payment%201@process-payment-1?type=Overview';

    const link = cy.get(`[data-testid="${testId}"]`).contains('process payment 1');
    link.should('have.attr', 'href', `#/processes/process payment 1@process-payment-1`);
    link.click();
    cy.url().should('eq', expectedUrl);
  });
});
