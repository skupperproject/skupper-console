declare namespace Cypress {
  interface Chainable {
    visitWithAuth(url?: string, options?: Record<string, unknown>): Chainable<null>;
    requestWithAuth(method: string, url: string, options?: Record<string, unknown>): Chainable<null>;
  }
}
