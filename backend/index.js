require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const Phonebook = require('./models/person')

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

morgan.token('post-body', (req) => {
  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))


app.get('/info', (request, response) => {
    Phonebook.find({}).then(phonebook => {
        const phonebookPeople = phonebook.length;
        const newDate = new Date();
        const html = `
                        <p>Phonebook has info for ${phonebookPeople} people</p>
                        <p>${newDate}</p>
                    `
                    
        response.send(html)
    })
})

app.get('/api/persons', (request, response) => {
  Phonebook.find({}).then(phonebook => {
    response.json(phonebook)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    Phonebook.findById(id)
    .then(person => {
        if (person) {
            response.json(person)
        }
        else {
            response.status(404).json({ error: `Person with ${id} id not found.` })
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    Phonebook.findByIdAndDelete(id)
    .then(result => {
        if (result.name) {
            response.status(200).json({ message: `Person with ${id} id deleted sucessfully.`, name:  result.name})
        } else {
            response.status(404).json({ error: `Person with ${id} id not found.` })
        }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    //const personExists = phonebook.find(person => person.name === body.name)

    if (!body.name || body.name === '') {
        return response.status(400).json({ 
            error: 'name missing' 
        })
    }
    if (!body.number || body.number === '') {
        return response.status(400).json({ 
            error: 'number missing' 
        })
    }

    // if (personExists) {
    //     return response.status(400).json({ 
    //         error: 'name must be unique' 
    //     })
    // }

    const person = new Phonebook({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        console.log('Person created successfully');
        response.json(savedPerson)
    })
})


app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Phonebook
    .findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
// controlador de solicitudes con endpoint desconocido
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error?.name === 'CastError' || error?.name === 'TypeError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}
// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})