import { getTestsIds } from '@config/testIds';

context('Sites', () => {
  const testId = `${getTestsIds.siteView('site-1')}`;

  beforeEach(() => {
    cy.visit('#/sites/site%201@site-1?type=Details');
  });

  it('should navigate to the Site section', () => {
    cy.get(`[data-testid="${testId}"]`).contains('site 1').should('have.length', 1);
    cy.get(`[data-testid="${testId}"]`).contains('config-grpc-site-1-test').should('have.length', 1);
  });

  it('should navigate to the correct site page when clicking on a link', () => {
    const expectedUrl = 'http://localhost:3000/#/sites/site%202@site-2';

    const link = cy.get(`[data-testid="${testId}"]`).contains('site 2');
    link.should('have.attr', 'href', `#/sites/site 2@site-2`);
    link.click();
    cy.url().should('eq', expectedUrl);
  });

  it('should navigate to the correct process page when clicking on a link', () => {
    const expectedUrl = 'http://localhost:3000/#/processes/process%20payment%201@process-payment-1';

    const link = cy.get(`[data-testid="${testId}"]`).contains('process payment 1');
    link.should('have.attr', 'href', `#/processes/process payment 1@process-payment-1`);
    link.click();
    cy.url().should('eq', expectedUrl);
  });
});
