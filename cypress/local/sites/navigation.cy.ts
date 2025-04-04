import { getTestsIds } from '../../../src/config/testIds';

context('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to the Network section', () => {
    cy.get(`[data-testid=${getTestsIds.navbarComponent()}]`).contains('Topology').click({ force: true });
    cy.location('hash').should('include', 'topology');
  });

  it('should navigate to the Sites section', () => {
    cy.get(`[data-testid=${getTestsIds.navbarComponent()}]`).contains('Sites').click({ force: true });
    cy.location('hash').should('include', 'sites');
  });

  it('should navigate to the Process Groups section', () => {
    cy.get(`[data-testid=${getTestsIds.navbarComponent()}]`).contains('Components').click({ force: true });
    cy.location('hash').should('include', 'components');
  });

  it('should navigate to the Processes section', () => {
    cy.get(`[data-testid=${getTestsIds.navbarComponent()}]`).contains('Processes').click({ force: true });
    cy.location('hash').should('include', 'processes');
  });

  it('should navigate to the Services', () => {
    cy.get(`[data-testid=${getTestsIds.navbarComponent()}]`).contains('Services').click({ force: true });
    cy.location('hash').should('include', 'services');
  });

  it('should redirect to the Not found page when url not exists', () => {
    cy.visit('/#/wrong-page');
    cy.get(`[data-testid=${getTestsIds.notFoundView()}]`).contains('Route not found').should('be.visible');
  });

  it("should go back or forward in the browser's history", () => {
    cy.get(`[data-testid=${getTestsIds.navbarComponent()}]`).contains('Sites').click({ force: true });
    cy.get(`[data-testid=${getTestsIds.navbarComponent()}]`).contains('Processes').click({ force: true });

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
});
