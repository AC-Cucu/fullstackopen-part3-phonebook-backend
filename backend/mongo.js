const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const passwordArgument = process.argv[2]
const nameArgument = process.argv[3]
const numberArgument = process.argv[4]

const url =
  `mongodb+srv://fullstack:${passwordArgument}@cluster0.ce2rqzs.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (nameArgument && numberArgument) 
{
  const person = new Person({
    name: nameArgument,
    number: numberArgument,
  })

  person.save().then(result => {    
    console.log(`added ${nameArgument} number ${numberArgument} to phonebook`)
    mongoose.connection.close()
  })

  return
}

Person.find({}).then(result => {
  const resultPhonebook = result
  console.log('phonebook:')

  resultPhonebook.forEach(person => {
    const {name, number} = person
    console.log(`${name} ${number}`)
  })
  mongoose.connection.close()
})
