const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')

const app = express()
app.use(express.json())  // Enable JSON body parsing
app.use(cors())          // Enable CORS for frontend access

// Middleware to log incoming requests
app.use((request, response, next) => {
  console.log(`${request.method} ${request.url}`)
  if (Object.keys(request.body).length > 0) {
    console.log('Request Body:', request.body)
  }
  next()
})

// Serve the frontend build files from the "dist" folder
app.use(express.static(path.join(__dirname, 'dist')))

let persons = [
  { id: 1, name: "Arto Hellas", number: "040-123456" },
  { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
  { id: 3, name: "Dan Abramov", number: "12-43-234345" },
  { id: 4, name: "Mary Poppendieck", number: "39-23-6423122" }
]

// Get all persons (API Endpoint)
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// Get a single person by ID
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).json({ error: 'Person not found' })
  }
})

// Add a new person
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Name or number is missing' })
  }

  if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({ error: 'Name must be unique' })
  }

  const person = {
    id: Math.floor(Math.random() * 10000), // Generate a random ID
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  response.json(person)
})

// Delete a person
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

// Serve frontend for all non-API routes
app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Server status message
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
