// Imports node's built in web server module
// Node.js uses CommonJS modules whose functions are very similar to ES6 modules
/*
const http = require('http')
 */

/* package.json notes
// npm run build:ui builds the frontend and copies the production version under the backend repository
// npm run deploy releases the current backend to heroku
// npm run deploy:full combines these two and contains the necessary git commands to update the backend repository
// pm run logs:prod shows the heroku logs
 */

// GET requests should be "safe" in that the executing request must not cause any side effects in the server
// All requests except POST should be "idempotent" where the side effects of N>0 identical requests is the same as
// for a single request

// If we make changes to the code, we have to restart the application. Solution is nodemon, which auto restarts
// the node application
// Express is a function that is used to create an express application stored in the app variable

// Common convention is to create the unique address for resources by comining name of resource type with its identifier
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/note')

// Whenever express gets an HTTP GET request it will first check if the build directory contains a file
// corresponding to the request's address

// HTTP GET requests to the address www.serveraddress.com/index.html or  www.serveraddress.com for the frontend

// GET requests to www.serveraddress.com/api/notes are handled by the backend
app.use(express.static('build'))

// Without json-parser, body property of request would be undefined
// json-parser takes the JSON data of request, transforms it into object, and then attaches it to body property of request

app.use(express.json())
app.use(cors())

// Event handler is registered to the server (every time an HTTP request is made to the server's address)
/*const app = http.createServer((request, response) => {
  // Content type application/json informs receiver that the data is in JSON
  // notes array gets transformed into JSON with stringify
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(notes))
})
 */

// Middleware are functions that can be used for handling request and response objects, and we can define our own

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
// next function yields control to the next middleware

app.use(requestLogger)


// Middleware functions have to be taken into use before routes if we want them to be executed before the event
// handlers are called
// Middleware functions defined after routes are in practice only called if no route handles the request

// Define two routes to the application

// First defines an event handler, used to handle GET requests made to the / root
// request contains all info of HTTP request, response is sued to define how the request is responded to

app.get('/', (request, response) => {
  // Calling send makes the server respond to the HTTP request by sending a response containing <h1>Hello World!</h1>
  // Since it's in a string, express sets the value of Content-Type header to text/html
  // Status code defaults to 200
  response.send('<h1>Hello World!</h1>')
})

// Second route defines event handler to handle GET requests made to notes path

app.get('/api/notes', (request, response) => {
  // Send notes array as JSON formatted string, express sets Content-Type to application/json
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

// Fetch a single resource
// Handles all GET requests that are of form api/notes/SOMETHING

app.get('/api/notes/:id', (request, response, next) => {
  // The request is in a string, so the id returned is a string even though the id in the note object is a number
  // Triple equals compares value and type, so we're getting a mismatch

  // Always add error and exception handling to promises
  Note.findById(request.params.id)
    .then(note => {
      // Error check the validity of the note
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    // We also need to check for a malformed id, a CastError
    // If next is called without a param, execution moves to the next route/middleware
    // If next is called with one, it goes to the error handler middleware
    .catch(error => next(error))

  /* const id = Number(request.params.id)
  const note = notes.find(note => {
    console.log(note.id, typeof note.id, id, typeof id, note.id === id)
  })

  // If no note is found, the variable is set to undefined, but the response is still 200
  // We should use a 404 status code

  const note = notes.find(note => note.id === id)
  if (note) {
    response.json(note)
  } else {
    // Set status with status method and end method for responding to request without sending data
    response.status(404).end()
  }
  */
})


/*
// Generate a new id for the note

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

*/

// POST request

app.post('/api/notes', (request, response, next) => {

  const body = request.body
  // Body is an object, so we should specify that certain properties cannot be empty, such as content
  // POST request allows users to add objects with arbitrary properties, so we only take the ones we need

  if (!body.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})

// PUT request

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    // updatedNote parameter of the event handler receives the original document without modification
    // new: true causes our event handler to be called with the new modified document instead of original
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))

})

// DELETE request

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(() => {
    // 204 status code means no content
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Express error handlers are middleware defined with a function that accepts 4 params
// Error handlers should always be the last loaded middleware

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(unknownEndpoint)

// this has to be the last loaded middleware.
app.use(errorHandler)

// Bind the http server assigned to the app variable to listen to the HTTP requests sent to port 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`)
})

// Server works regardless of the latter part of the localhost:3001 URL

// Primary purpose of backend server is to offer raw data in JSON format to frontend