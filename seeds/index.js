const mongoose = require('mongoose')
const { seedCategories } = require('./category')
const { seedExpenses } = require('./expense')

mongoose
    .connect('mongodb://localhost:27017/gos-gos', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async (client) => {
        await seedCategories()
        await seedExpenses()
        client.disconnect()
    })
    .catch((err) => {
        console.log('Mongo connection error!')
        console.log(err)
    })
