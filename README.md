# Expense Tracker

Research project for MSc dissertation: AI-Assisted Flaky Test Detection in CI/CD Pipelines.

## Stack
- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla HTML/CSS/JS
- **Database**: JSON file (data/db.json)
- **Testing**: Cypress e2e
- **CI/CD**: GitHub Actions

## Setup

```bash
npm install
npm start
```

Open http://localhost:3004

## Running Tests

```bash
# Interactive
npm run cy:open

# Headless (CI mode)
npm run test:ci
```

## Features
- Full CRUD operations for expenses
- Search and filter functionality  
- Dashboard with statistics
- Responsive UI
- RESTful API at /api/expenses
