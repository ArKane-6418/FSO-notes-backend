const mongoose = require('mongoose')
require('dotenv').config()

// MONGODB_URI will be defined in dotenv
const uri = process.env.MONGODB_URI

console.log(`connecting to ${uri}`)

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

// Specify validation rules for the schema, better way of validating format than 400 request
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  important: Boolean
})

// Frontend assumes every object has a unique id in the id field, we want
// to remove the mongo _id field and the __v field and replace id
// with the mongo id as a string instead of an object

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// We're defining a Node module, and the public interface
// is defined by setting module.exports
module.exports = mongoose.model('Note', noteSchema)