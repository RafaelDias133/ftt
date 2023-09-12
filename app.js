const express = require('express');
const sqlite3 = require('sqlite3');
const serialize = require('serialize-javascript');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configure SQLite database
const db = new sqlite3.Database('./database.sqlite');

// Create the tasks table if it doesn't exist
db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, completed INTEGER)'
  );
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Add a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  db.run('INSERT INTO tasks (title, completed) VALUES (?, 0)', [title], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'An error occurred while adding the task.' });
    }
    res.redirect('/tasks');
  });
});

// List all tasks
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', (err, tasks) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'An error occurred while fetching tasks.' });
    }
    res.render('view.ejs', { tasks });
  });
});

// Update a task
app.post('/tasks/:id/update', (req, res) => {
  const taskId = req.params.id;
  const { title } = req.body;
  db.run('UPDATE tasks SET title = ? WHERE id = ?', [title, taskId], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'An error occurred while updating the task.' });
    }
    res.redirect('/tasks');
  });
});

// 
app.post('/tasks/:id/delete', (req, res) => {
  const taskId = req.params.id;
  db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'An error occurred while deleting the task.' });
    }
    res.redirect('/tasks');
  });
});

// Mark a task as completed
app.post('/tasks/:id/complete', (req, res) => {
  const taskId = req.params.id;
  db.run('UPDATE tasks SET completed = 1 WHERE id = ?', [taskId], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'An error occurred while marking the task as completed.' });
    }
    res.redirect('/tasks');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});