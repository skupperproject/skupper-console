context('Sites', () => {
  beforeEach(() => {
    cy.visit('#/sites');
  });

  it('should navigate to the Sites section', () => {
    cy.get('[data-testid=sk-sites-view]').contains('Sites').should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains('site 1').should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains('site 2').should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains('site 3').should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains('site 4').should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains('site 5').should('have.length', 1);
  });
});
