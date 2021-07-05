// Imports node's built in web server module
// Node.js uses CommonJS modules whose functions are very similar to ES6 modules
/*
const http = require('http')
 */

// GET requests should be "safe" in that the executing request must not cause any side effects in the server
// All requests except POST should be "idempotent" where the side effects of N>0 identical requests is the same as
// for a single request

// If we make changes to the code, we have to restart the application. Solution is nodemon, which auto restarts
// the node application
// Express is a function that is used to create an express application stored in the app variable

// Common convention is to create the unique address for resources by comining name of resource type with its identifier
const express = require('express')
const app = express()
const cors = require("cors")

// Without json-parser, body property of request would be undefined
// json-parser takes the JSON data of request, transforms it into object, and then attaches it to body property of request
app.use(express.json())
app.use(cors())

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: new Date("2019-05-30T17:30:31.098Z"),
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: new Date("2019-05-30T18:39:34.091Z"),
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: new Date("2019-05-30T19:20:14.298Z"),
    important: true
  }
]

// Event handler is registered to the server (every time an HTTP request is made to the server's address)
/*const app = http.createServer((request, response) => {
  // Content type application/json informs receiver that the data is in JSON
  // notes array gets transformed into JSON with stringify
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(notes))
})
 */

// Middleware are functions that can be used for handling request and response objects, and we can define our own

/* const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
// next function yields control to the next middleware

app.use(requestLogger)
 */

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
  response.send("<h1>Hello World!</h1>")
})

// Second route defines event handler to handle GET requests made to notes path

app.get('/api/notes', (request, response) => {
  // Send notes array as JSON formatted string, express sets Content-Type to application/json
  response.json(notes)
})

// Fetch a single resource
// Handles all GET requests that are of form api/notes/SOMETHING

app.get('/api/notes/:id', (request, response) => {
  // The request is in a string, so the id returned is a string even though the id in the note object is a number
  // Triple equals compares value and type, so we're getting a mismatch

  const id = Number(request.params.id)
  /* const note = notes.find(note => {
    console.log(note.id, typeof note.id, id, typeof id, note.id === id)
  })
   */

  // If no note is found, the variable is set to undefined, but the response is still 200
  // We should use a 404 status code
  const note = notes.find(note => note.id === id)
  if (note) {
    response.json(note)
  } else {
    // Set status with status method and end method for responding to request without sending data
    response.status(404).end()
  }
})


// Generate a new id for the note

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

// POST request

app.post('/api/notes', (request, response) => {

  const body = request.body
  // Body is an object, so we should specify that certain properties cannot be empty, such as content
  // POST request allows users to add objects with arbitrary properties, so we only take the ones we need

  if (!body.content) {
    return response.status(400).json({ error: 'content missing'})
  }

  const note = {
    id: generateId(),
    content: body.content,
    important: body.important || false,
    date: new Date(),
  }

  notes = notes.concat(note)

  response.json(note)
})

// DELETE request

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)
  // 204 status code means no content
  response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


// Bind the http server assigned to the app variable to listen to the HTTP requests sent to port 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`)
})

// Server works regardless of the latter part of the localhost:3001 URL

// Primary purpose of backend server is to offer raw data in JSON format to frontend