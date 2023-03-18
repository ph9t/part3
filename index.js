require('dotenv').config()
const express = require('express')
// const mongoose = require('mongoose')
const cors = require('cors')

const Note = require('./models/note')

const app = express()

// const url = `mongodb+srv://ph9t:ph9t@an9el.7dvxbvi.mongodb.net/noteApp?retryWrites=true&w=majority`
//
// mongoose.set('strictQuery', false)
// mongoose.connect(url)
//
// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// })
//
// noteSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.String()
//     delete returnedObject._id
//     delete returnedObject.__v
//   }
// })
//
// const Note = mongoose.model('Note', noteSchema)

const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method)
  console.log('Path:   ', request.path)
  console.log('Body:   ', request.body)
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// let notes = [
//   {
//     id: 1,
//     content: 'HTML is easy',
//     important: true,
//   },
//   {
//     id: 2,
//     content: 'Browser can execute only JavaScript',
//     important: false,
//   },
//   {
//     id: 3,
//     content: 'GET and POST are the most important methods of HTTP protocol',
//     important: true,
//   },
// ]

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(requestLogger)

app.get('/', (request, response) => {
  response.send('<h1>Hello, world!</h1>')
})

app.get('/api/notes', (request, response) => {
  // response.json(notes)
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  // const id = Number(request.params.id)

  // // console.log(id)
  // const note = notes.find(note => {
  //   // console.log(note.id, typeof note.id, id, typeof id, note.id === id)
  //   return note.id === id
  // })
  // // console.log(note)

  // if (note) {
  //   response.json(note)
  // } else {
  //   // response.statusMessage = "Kiyo, ano na?"
  //   response.status(404).end()
  // }
  // response.json(note)

  // Note.findById(request.params.id).then(note => {
  //   response.json(note)
  // })
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    // .catch(error => {
    //   console.log(error)
    //   // response.status(500).end()
    //   response.status(400).send({ error: 'malformatted id' })
    // })
    .catch(error => next(error))
})

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0
  return maxId + 1
}

app.post('/api/notes', (request, response, next) => {
  // const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0

  // const note = request.body
  // note.id = maxId + 1
  const body = request.body

  // if (!body.content) {
  // if (body.content === undefined) {
  //   return response.status(400).json({
  //     error: 'content missing',
  //   })
  // }

  // const note = {
  const note = new Note({
    content: body.content,
    important: body.important || false,
    // id: generateId(),
  })

  // notes = notes.concat(note)

  // response.json(note)

  note
    .save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  //  const body = request.body
  const { content, important } = request.body

  //  const note = {
  //    content: body.content,
  //    important: body.important,
  //  }

  // Note.findByIdAndUpdate(request.params.id, note, { new: true })
  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  // notes = notes.filter(note => note.id !== id)

  // response.status(204).end()
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

// const PORT = 3001
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
