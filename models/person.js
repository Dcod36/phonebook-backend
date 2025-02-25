/* eslint-env node */

const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('Attempting to connect to MongoDB...')

mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d+$/.test(v)  // Ensures format like 09-1234556 or 040-22334455
      },
      message: props => `${props.value} is not a valid phone number! Use format XX-XXXXXXX or XXX-XXXXXXXX`
    }
  }
})

module.exports = mongoose.model('Person', personSchema)
