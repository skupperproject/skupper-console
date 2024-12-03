import sitesData from '../../../../mocks/data/SITES.json';

context('Sites', () => {
  beforeEach(() => {
    cy.visit('#/sites');
  });

  it('should navigate to the Sites section', () => {
    cy.get('[data-testid=sk-sites-view]').contains('Sites').should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains(sitesData.results[0].name).should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains(sitesData.results[1].name).should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains(sitesData.results[2].name).should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains(sitesData.results[3].name).should('have.length', 1);
    cy.get('[data-testid=sk-sites-view]').contains(sitesData.results[4].name).should('have.length', 1);
  });
});
