const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3004;
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { expenses: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Seed data if empty
function seedIfEmpty() {
  const db = readDB();
  if (db.expenses.length === 0) {
    db.expenses = [
    {
        "id": "seed-1",
        "title": "Grocery Shopping",
        "description": "Sample description for Grocery Shopping. This is test data for the flaky test detection research study.",
        "category": "Food",
        "createdAt": "2026-07-21T00:21:18.581Z",
        "amount": "71.41",
        "type": "expense"
    },
    {
        "id": "seed-2",
        "title": "Monthly Rent",
        "description": "Sample description for Monthly Rent. This is test data for the flaky test detection research study.",
        "category": "Transport",
        "createdAt": "2026-07-20T00:21:18.581Z",
        "amount": "133.74",
        "type": "income"
    },
    {
        "id": "seed-3",
        "title": "Netflix Subscription",
        "description": "Sample description for Netflix Subscription. This is test data for the flaky test detection research study.",
        "category": "Entertainment",
        "createdAt": "2026-07-19T00:21:18.581Z",
        "amount": "68.95",
        "type": "expense"
    },
    {
        "id": "seed-4",
        "title": "Gym Membership",
        "description": "Sample description for Gym Membership. This is test data for the flaky test detection research study.",
        "category": "Health",
        "createdAt": "2026-07-18T00:21:18.581Z",
        "amount": "11.21",
        "type": "income"
    },
    {
        "id": "seed-5",
        "title": "Restaurant Dinner",
        "description": "Sample description for Restaurant Dinner. This is test data for the flaky test detection research study.",
        "category": "Shopping",
        "createdAt": "2026-07-17T00:21:18.581Z",
        "amount": "84.07",
        "type": "expense"
    },
    {
        "id": "seed-6",
        "title": "Petrol",
        "description": "Sample description for Petrol. This is test data for the flaky test detection research study.",
        "category": "Bills",
        "createdAt": "2026-07-16T00:21:18.581Z",
        "amount": "207.84",
        "type": "income"
    },
    {
        "id": "seed-7",
        "title": "Electric Bill",
        "description": "Sample description for Electric Bill. This is test data for the flaky test detection research study.",
        "category": "Food",
        "createdAt": "2026-07-15T00:21:18.581Z",
        "amount": "181.91",
        "type": "expense"
    },
    {
        "id": "seed-8",
        "title": "New Shoes",
        "description": "Sample description for New Shoes. This is test data for the flaky test detection research study.",
        "category": "Transport",
        "createdAt": "2026-07-14T00:21:18.581Z",
        "amount": "166.49",
        "type": "income"
    },
    {
        "id": "seed-9",
        "title": "Coffee",
        "description": "Sample description for Coffee. This is test data for the flaky test detection research study.",
        "category": "Entertainment",
        "createdAt": "2026-07-13T00:21:18.581Z",
        "amount": "114.66",
        "type": "expense"
    },
    {
        "id": "seed-10",
        "title": "Phone Bill",
        "description": "Sample description for Phone Bill. This is test data for the flaky test detection research study.",
        "category": "Health",
        "createdAt": "2026-07-12T00:21:18.581Z",
        "amount": "180.29",
        "type": "income"
    }
];
    writeDB(db);
  }
}
seedIfEmpty();

// GET all
app.get('/api/expenses', (req, res) => {
  const db = readDB();
  let items = db.expenses;
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    items = items.filter(i => i.title && i.title.toLowerCase().includes(q) || (i.name && i.name.toLowerCase().includes(q)));
  }
  if (req.query.category) {
    items = items.filter(i => i.category === req.query.category);
  }
  res.json(items);
});

// GET one
app.get('/api/expenses/:id', (req, res) => {
  const db = readDB();
  const item = db.expenses.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST create
app.post('/api/expenses', (req, res) => {
  const db = readDB();
  const item = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  db.expenses.push(item);
  writeDB(db);
  res.status(201).json(item);
});

// PUT update
app.put('/api/expenses/:id', (req, res) => {
  const db = readDB();
  const idx = db.expenses.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.expenses[idx] = { ...db.expenses[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(db);
  res.json(db.expenses[idx]);
});

// DELETE
app.delete('/api/expenses/:id', (req, res) => {
  const db = readDB();
  const idx = db.expenses.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.expenses.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Deleted successfully' });
});

// Reset endpoint for testing
app.post('/api/reset', (req, res) => {
  const initial = { expenses: [] };
  writeDB(initial);
  seedIfEmpty();
  res.json({ message: 'Database reset' });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Expense Tracker' }));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log('Expense Tracker server running on http://localhost:3004'));
