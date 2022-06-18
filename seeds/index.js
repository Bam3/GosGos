const mongoose = require('mongoose')
const { seedCategories } = require('./category')
const { seedExpenses } = require('./expense')
const { seedUsers } = require('./user')

mongoose
    .connect('mongodb://localhost:27017/gos-gos', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async (client) => {
        await seedUsers()
        await seedCategories()
        await seedExpenses()

        await client.disconnect()
    })
    .catch((err) => {
        console.log('Mongo connection error!')
        console.log(err)
    })
