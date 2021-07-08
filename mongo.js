const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const uri = `mongodb+srv://ArKane:${password}@cluster0.ry4bo.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean
})

// "Note" parameter is singular name of the model, by mongoose convention, the collection name is to lowercase plural
// Document dbs like mongo are schemaless, don't care about the structure of the data
// Schema is given at the level of the application that defines the shape of the docs stored in given collection

const Note = mongoose.model('Note', noteSchema)

// Create a new note object with help from Note model
// Models are constructor functions that create new JS objects based on provided parameters
/* const note = new Note({
  content: 'Callback functions suck',
  date: new Date(),
  important: true,
})
*/

// Objects are retrieved with the find method where we can specify filters
// Since we didn't specify any, we get all the notes and print them
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})

// Save the object with the same method that can be provided with event handler through then
// Connection needs to close to finish program execution
/* note.save().then(result => {
   console.log('note saved!')
   mongoose.connection.close()
})
*/