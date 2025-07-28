const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())
app.use(morgan('dev'))

let phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => {
    const maxId = phonebook.length > 0
        ? Math.max(...phonebook.map(n => n.id))
        : 0

    const radomNumber = Math.floor(Math.random() * 9999) + maxId+1;
    return radomNumber
}

app.get('/info', (request, response) => {
    const phonebookPeople = phonebook.length;
    const newDate = new Date();
    const html = `
                    <p>Phonebook has info for ${phonebookPeople} people</p>
                    <p>${newDate}</p>
                `
                
    response.send(html)
})

app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = phonebook.find(person => person.id === id)

    if (person) {
    response.json(person)
    } else {
    response.status(404).json({ error: `Person with ${id} id not found.` })
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const personExists = phonebook.find(person => person.id === id)

    if (personExists) {
    phonebook = phonebook.filter(person => person.id !== id)
    response.status(200).json({ message: `Person with ${id} id deleted sucessfully.` })
    } else {
    response.status(404).json({ error: `Person with ${id} id not found.` })
    }
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    const personExists = phonebook.find(person => person.name === body.name)

    if (!body.name) {
        return response.status(400).json({ 
            error: 'name missing' 
        })
    }
    if (!body.number) {
        return response.status(400).json({ 
            error: 'number missing' 
        })
    }

    if (personExists) {
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }

    const person = {
    id: generateId(),
    name: body.name,
    number: body.number
    }

    const newperson = person

    phonebook = phonebook.concat(newperson)

    response.json(newperson)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)