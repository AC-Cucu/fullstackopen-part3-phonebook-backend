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

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id

    Phonebook.findById(id).then(person => {
        if (person) {
        response.json(person)
        } else {
        response.status(404).json({ error: `Person with ${id} id not found.` })
        }
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

    Phonebook.findByIdAndDelete(id)
    .then(result => {
        if (result.name) {
            response.status(200).json({ message: `Person with ${id} id deleted sucessfully.`, name:  result.name})
        } else {
            response.status(404).json({ error: `Person with ${id} id not found.` })
        }
    })
    .catch(error => {
        response.status(500).json({ error: `Error deleting person: ${error}.` })
    });    
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})