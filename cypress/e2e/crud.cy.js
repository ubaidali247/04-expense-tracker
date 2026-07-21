// CRUD Tests - Expense Tracker
describe('CRUD Operations - Expense Tracker', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('.nav-link[data-page="expenses"]').click();
    cy.get('#expenses-list').should('be.visible');
  });

  it('shows seeded items on expenses list', () => {
    cy.get('#expenses-list .item-card').should('have.length.gte', 1);
  });

  it('creates a new item successfully', () => {
    cy.get('#btn-add-new').click();
    cy.get('#field-title').type('Test Expense');
    cy.get('#field-description, #field-content, #field-review, #field-notes').first().type('Test description for new item');
    cy.get('#btn-submit').click();
    cy.get('#page-expenses').should('not.have.class', 'hidden');
    cy.get('#expenses-list').should('contain', 'Test Expense');
  });

  it('shows new item in the list after creation', () => {
    const title = 'Unique Item ' + Date.now();
    cy.get('#btn-add-new').click();
    cy.get('#field-title').type(title);
    cy.get('#btn-submit').click();
    cy.get('#expenses-list').should('contain', title);
  });

  it('item card has view button', () => {
    cy.get('.item-card').first().find('.btn-view').should('be.visible');
  });

  it('item card has edit button', () => {
    cy.get('.item-card').first().find('.btn-edit-card').should('be.visible');
  });

  it('item card has delete button', () => {
    cy.get('.item-card').first().find('.btn-delete-card').should('be.visible');
  });

  it('view button shows detail page', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#page-detail').should('not.have.class', 'hidden');
  });

  it('detail page has back button', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#btn-back').should('be.visible');
  });

  it('detail page has edit button', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#btn-edit').should('be.visible');
  });

  it('detail page has delete button', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#btn-delete').should('be.visible');
  });

  it('back button returns from detail to list', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#btn-back').click();
    cy.get('#page-expenses').should('not.have.class', 'hidden');
  });

  it('edit button from list opens edit form', () => {
    cy.get('.item-card').first().find('.btn-edit-card').click();
    cy.get('#page-add').should('not.have.class', 'hidden');
    cy.get('#item-id').invoke('val').should('not.be.empty');
  });

  it('edit form is pre-filled with existing values', () => {
    cy.get('.item-card').first().find('.btn-edit-card').click();
    cy.get('#field-title').invoke('val').should('not.be.empty');
  });

  it('can update an existing item', () => {
    cy.get('.item-card').first().find('.btn-edit-card').click();
    cy.get('#field-title').clear().type('Updated Expense');
    cy.get('#btn-submit').click();
    cy.get('#expenses-list').should('contain', 'Updated Expense');
  });

  it('delete shows confirmation dialog', () => {
    cy.on('window:confirm', () => false);
    cy.get('.item-card').first().find('.btn-delete-card').click();
  });

  it('confirming delete removes item from list', () => {
    cy.get('#expenses-list .item-card').then($cards => {
      const initialCount = $cards.length;
      cy.on('window:confirm', () => true);
      cy.get('.item-card').first().find('.btn-delete-card').click();
      cy.get('#expenses-list .item-card').should('have.length', initialCount - 1);
    });
  });

  it('api returns items as array', () => {
    cy.request('/api/expenses').its('body').should('be.an', 'array');
  });

  it('api create endpoint returns 201', () => {
    cy.request({
      method: 'POST',
      url: '/api/expenses',
      body: {"title":"Test Expense","amount":"49.99","category":"Food","date":"2024-01-15","notes":"Test notes","type":"expense"},
    }).its('status').should('eq', 201);
  });

  it('dashboard shows total count on stat card', () => {
    cy.visit('/');
    cy.get('#stat-total').invoke('text').then(count => {
      expect(parseInt(count)).to.be.gte(0);
    });
    cy.get('.stat-card').should('have.length', 3);
  });
});
