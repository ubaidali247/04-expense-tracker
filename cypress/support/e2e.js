
Cypress.Commands.add('resetDB', () => {
  cy.request('POST', 'http://localhost:3004/api/reset');
});

Cypress.Commands.add('getItems', () => {
  return cy.request('GET', 'http://localhost:3004/api/expenses').its('body');
});

beforeEach(() => {
  cy.resetDB();
});
