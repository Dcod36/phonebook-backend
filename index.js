require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Person = require('./models/person');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.log('Error connecting to MongoDB:', error.message));

// ✅ Get all persons
app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => response.json(persons))
        .catch(error => next(error));
});

// ✅ Get a single person by ID
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) response.json(person);
            else response.status(404).json({ error: 'Person not found' });
        })
        .catch(error => next(error));
});

// ✅ Delete a person by ID
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(person => {
            if (person) response.status(204).end();
            else response.status(404).json({ error: 'Person not found' });
        })
        .catch(error => next(error));
});

// ✅ Add a new person
app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body;
    if (!name || !number) {
        return response.status(400).json({ error: 'Name and number are required' });
    }

    const person = new Person({ name, number });
    person.save()
        .then(savedPerson => response.json(savedPerson))
        .catch(error => next(error));
});

// ✅ Update a person's number
app.put('/api/persons/:id', (request, response, next) => {
    const { number } = request.body;
    Person.findByIdAndUpdate(request.params.id, { number }, { new: true, runValidators: true })
        .then(updatedPerson => {
            if (updatedPerson) response.json(updatedPerson);
            else response.status(404).json({ error: 'Person not found' });
        })
        .catch(error => next(error));
});

// ✅ Get phonebook info
app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(count => {
            response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`);
        })
        .catch(error => next(error));
});

// ✅ Error handling middleware
app.use((error, request, response, next) => {
    console.error(error.message);
    if (error.name === 'CastError') {
        return response.status(400).json({ error: 'Malformatted ID' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }
    next(error);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
