/// <reference types="Cypress" />

context('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Navigate to the Network section', () => {
    cy.get('[data-cy=sk-nav-bar]').contains('Topology').click({ force: true });
    cy.location('hash').should('include', 'topology');
  });

  it('Navigate to the Sites section', () => {
    cy.get('[data-cy=sk-nav-bar]').contains('Sites').click({ force: true });
    cy.location('hash').should('include', 'sites');
  });

  it('Navigate to the Process Groups section', () => {
    cy.get('[data-cy=sk-nav-bar]').contains('Components').click({ force: true });
    cy.location('hash').should('include', 'components');
  });

  it('Navigate to the Processes section', () => {
    cy.get('[data-cy=sk-nav-bar]').contains('Processes').click({ force: true });
    cy.location('hash').should('include', 'processes');
  });

  it('Navigate to the Addresses', () => {
    cy.get('[data-cy=sk-nav-bar]').contains('Addresses').click({ force: true });
    cy.location('hash').should('include', 'addresses');
  });

  it('Redirect to the Not found page when url not exists', () => {
    cy.visit('/#/wrong-page');
    cy.get('[data-cy=sk-not-found]').contains('Page not found').should('be.visible');
  });

  it("Go back or forward in the browser's history", () => {
    cy.get('[data-cy=sk-nav-bar]').contains('Sites').click({ force: true });
    cy.get('[data-cy=sk-nav-bar]').contains('Processes').click({ force: true });

    cy.go('back');
    cy.location('hash').should('include', 'sites');

    cy.go('forward');
    cy.location('hash').should('include', 'processes');

    // clicking back
    cy.go(-1);
    cy.location('hash').should('include', 'sites');

    // clicking forward
    cy.go(1);
    cy.location('hash').should('include', 'processes');
  });

  it('Reload the page and stay on the last page selected', () => {
    cy.get('[data-cy=sk-nav-bar]').contains('Sites').click({ force: true });
    cy.reload();
    cy.location('hash').should('include', 'sites');

    // reload the page without using the cache
    cy.reload(true);
    cy.get('[data-cy=sk-nav-bar]').contains('Sites').click({ force: true });
    cy.location('hash').should('include', 'sites');
  });
});
