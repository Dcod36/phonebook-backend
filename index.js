/* eslint-env node */

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const Person = require('./models/person');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, 'dist')));

// ✅ Serve frontend for unknown routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(persons => res.json(persons));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;

  const person = new Person({ name, number });

  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error));
});

app.get('/info', (req, res) => {
  Person.countDocuments({})
    .then(count => {
      res.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`);
    });
});

// ✅ Handle errors
app.use((error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Malformatted ID' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

// ✅ Serve React frontend for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
