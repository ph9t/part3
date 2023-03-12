const express = require('express')
const cors = require('cors')

const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method)
  console.log('Path:   ', request.path)
  console.log('Body:   ', request.body)
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    important: true,
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
]

app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.get('/', (request, response) => {
  response.send('<h1>Hello, world!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)

  // console.log(id)
  const note = notes.find(note => {
    // console.log(note.id, typeof note.id, id, typeof id, note.id === id)
    return note.id === id
  })
  // console.log(note)

  if (note) {
    response.json(note)
  } else {
    // response.statusMessage = "Kiyo, ano na?"
    response.status(404).end()
  }
  response.json(note)
})

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  // const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0

  // const note = request.body
  // note.id = maxId + 1
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
