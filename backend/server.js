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

// ============================================================
// FLAKINESS INJECTION LAYER v2
// MSc Dissertation - AI-Assisted Flaky Test Detection
// Probabilities tuned for ~30-40% failure rate
// ============================================================
const FLAKY_CONFIG = {
  enabled: true,
  slowProbability: 0.30,   // 30% chance of slow GET response
  errorProbability: 0.20,  // 20% chance of 500 on POST
  slowDelayMs: { min: 2000, max: 4500 }  // Below Cypress 8s timeout but enough to cause issues
};

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shouldBeFlaky(prob) {
  return FLAKY_CONFIG.enabled && Math.random() < prob;
}

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

function seedIfEmpty() {
  const db = readDB();
  if (db.expenses.length === 0) {
    db.expenses = [
    {
        "id": "seed-1",
        "title": "Grocery Shopping",
        "description": "Sample description for research study item 1.",
        "category": "Food",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "amount": "10.0",
        "type": "expense"
    },
    {
        "id": "seed-2",
        "title": "Monthly Rent",
        "description": "Sample description for research study item 2.",
        "category": "Transport",
        "createdAt": "2024-02-02T10:00:00.000Z",
        "amount": "25.5",
        "type": "income"
    },
    {
        "id": "seed-3",
        "title": "Netflix Subscription",
        "description": "Sample description for research study item 3.",
        "category": "Entertainment",
        "createdAt": "2024-03-03T10:00:00.000Z",
        "amount": "41.0",
        "type": "expense"
    },
    {
        "id": "seed-4",
        "title": "Gym Membership",
        "description": "Sample description for research study item 4.",
        "category": "Health",
        "createdAt": "2024-04-04T10:00:00.000Z",
        "amount": "56.5",
        "type": "income"
    },
    {
        "id": "seed-5",
        "title": "Restaurant Dinner",
        "description": "Sample description for research study item 5.",
        "category": "Food",
        "createdAt": "2024-05-05T10:00:00.000Z",
        "amount": "72.0",
        "type": "expense"
    },
    {
        "id": "seed-6",
        "title": "Petrol",
        "description": "Sample description for research study item 6.",
        "category": "Transport",
        "createdAt": "2024-06-06T10:00:00.000Z",
        "amount": "87.5",
        "type": "income"
    },
    {
        "id": "seed-7",
        "title": "Electric Bill",
        "description": "Sample description for research study item 7.",
        "category": "Entertainment",
        "createdAt": "2024-07-07T10:00:00.000Z",
        "amount": "103.0",
        "type": "expense"
    },
    {
        "id": "seed-8",
        "title": "New Shoes",
        "description": "Sample description for research study item 8.",
        "category": "Health",
        "createdAt": "2024-08-08T10:00:00.000Z",
        "amount": "118.5",
        "type": "income"
    }
];
    writeDB(db);
  }
}
seedIfEmpty();

// GET all - 30% chance of slow response
app.get('/api/expenses', (req, res) => {
  const handler = () => {
    const db = readDB();
    let items = db.expenses;
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      items = items.filter(i => (i.title && i.title.toLowerCase().includes(q)) || (i.name && i.name.toLowerCase().includes(q)));
    }
    if (req.query.category) items = items.filter(i => i.category === req.query.category);
    res.json(items);
  };
  if (shouldBeFlaky(FLAKY_CONFIG.slowProbability)) {
    const delay = randomDelay(FLAKY_CONFIG.slowDelayMs.min, FLAKY_CONFIG.slowDelayMs.max);
    console.log(`[FLAKY] Slow GET /api/expenses +${delay}ms`);
    setTimeout(handler, delay);
  } else { handler(); }
});

// GET one
app.get('/api/expenses/:id', (req, res) => {
  const db = readDB();
  const item = db.expenses.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST - 20% chance of 500 error
app.post('/api/expenses', (req, res) => {
  if (shouldBeFlaky(FLAKY_CONFIG.errorProbability)) {
    console.log(`[FLAKY] 500 error on POST /api/expenses`);
    return res.status(500).json({ error: 'Flaky server error - injected for research' });
  }
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

app.post('/api/reset', (req, res) => {
  writeDB({ expenses: [] });
  seedIfEmpty();
  res.json({ message: 'Reset complete' });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Expense Tracker', flakyEnabled: FLAKY_CONFIG.enabled }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log('Expense Tracker running on http://localhost:3004 [FLAKY v2]'));
