import { getTestsIds } from '@config/testIds';

context('Error pages', () => {
  beforeEach(() => {});

  it('should redirect to the Not found page when url not exists', () => {
    cy.visit('/#/wrong-page');
    cy.get(`[data-testid=${getTestsIds.notFoundView()}]`).contains('Route not found').should('be.visible');
  });
});
