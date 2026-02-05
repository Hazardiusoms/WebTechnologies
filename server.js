require('dotenv').config();
const path = require('path');
const express = require('express');
const fs = require('fs').promises;
const { habitsDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded form bodies
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (required for API requests)
app.use(express.json());

// Custom logger middleware - logs HTTP method and URL
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

// Search route with query parameter q
app.get('/search', (req, res) => {
  const query = req.query.q;
  
  // Validation: return 400 if query parameter is provided but empty
  // If no query parameter at all, show the search form
  if (req.query.hasOwnProperty('q') && (!query || query.trim() === '')) {
    return res.status(400).json({ error: 'Query parameter "q" cannot be empty' });
  }
  
  res.sendFile(path.join(__dirname, 'views', 'search.html'));
});

// Item route with route parameter id
app.get('/item/:id', (req, res) => {
  const id = req.params.id;
  
  // Validation: return 400 if id is missing or invalid
  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'Item ID is required' });
  }
  
  res.sendFile(path.join(__dirname, 'views', 'item.html'));
});

// API endpoint - returns project information in JSON format
app.get('/api/info', (req, res) => {
  res.json({
    project: 'FocusFlow',
    description: 'A simple habit and routine tracker that helps you stay consistent with clear weekly insights.',
    version: '1.0.0',
    team: [
      'Nursalim Onalbayev - SE-2425',
      'Zhalgas Torekeldi - SE-2425',
      'Alisher Akhmet - SE-2425'
    ],
    routes: {
      home: '/',
      about: '/about',
      contact: '/contact',
      search: '/search?q=<query>',
      item: '/item/:id',
      api: '/api/info'
    },
    technologies: ['Express.js', 'Node.js']
  });
});

// ========== CRUD API Routes for Habits ==========

// GET /api/habits - Return all habits (sorted by id ASC)
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await habitsDb.getAll();
    res.status(200).json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/habits/:id - Return a single habit by id
app.get('/api/habits/:id', async (req, res) => {
  const id = req.params.id;

  // Validation: check if id is a valid number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const habit = await habitsDb.getById(parseInt(id));
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.status(200).json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/habits - Create a new habit
app.post('/api/habits', async (req, res) => {
  const { title, description } = req.body;

  // Validation: check if required fields are present
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!description || description.trim() === '') {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const newHabit = await habitsDb.create(title.trim(), description.trim());
    res.status(201).json(newHabit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/habits/:id - Update an existing habit by id
app.put('/api/habits/:id', async (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;

  // Validation: check if id is a valid number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  // Validation: check if required fields are present
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!description || description.trim() === '') {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    // Check if habit exists
    const existingHabit = await habitsDb.getById(parseInt(id));
    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Update the habit
    const updated = await habitsDb.update(parseInt(id), title.trim(), description.trim());
    
    if (updated) {
      const updatedHabit = await habitsDb.getById(parseInt(id));
      res.status(200).json(updatedHabit);
    } else {
      res.status(500).json({ error: 'Failed to update habit' });
    }
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/habits/:id - Delete a habit by id
app.delete('/api/habits/:id', async (req, res) => {
  const id = req.params.id;

  // Validation: check if id is a valid number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    // Check if habit exists
    const existingHabit = await habitsDb.getById(parseInt(id));
    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Delete the habit
    const deleted = await habitsDb.delete(parseInt(id));
    
    if (deleted) {
      res.status(200).json({ message: 'Habit deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete habit' });
    }
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle contact form submission
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Server-side validation: return 400 if required parameters are missing
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const submission = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    date: new Date().toISOString(),
  };

  // Save submissions to submissions.json using fs.writeFile()
  try {
    const file = path.join(__dirname, 'submissions.json');
    let data = [];
    try {
      const existing = await fs.readFile(file, 'utf8');
      data = JSON.parse(existing);
      if (!Array.isArray(data)) data = [];
    } catch (err) {
      // ignore - we'll create the file
    }
    data.push(submission);
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save submission:', err);
    return res.status(500).json({ error: 'Failed to save submission' });
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You • FocusFlow</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <header class="site-header">
        <nav class="nav">
          <a class="nav__brand" href="/">FocusFlow</a>
          <div class="nav__links">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="/search">Search</a>
          </div>
        </nav>
      </header>
      <main class="container">
        <section class="card">
          <h2>Thanks, ${escapeHtml(name)}!</h2>
          <p>Your message has been received and saved.</p>
          <p><a href="/" class="button primary">Return home</a></p>
        </section>
      </main>
    </body>
    </html>
  `);
});

// 404 handler for unknown routes
// Returns JSON for API routes, HTML for regular pages
app.use((req, res) => {
  // Check if the route starts with /api
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Route not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Local URL: http://localhost:${PORT}`);
  }
});

// Simple HTML escape to avoid injection in the response
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}