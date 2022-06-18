const mongoose = require('mongoose')
const { seedCategories } = require('./categories')
const { seedExpenses } = require('./expense')

mongoose
    .connect('mongodb://localhost:27017/gos-gos', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        await seedCategories()
        await seedExpenses()
        mongoose.connection.close()
    })
    .catch((err) => {
        console.log('Mongo connection error!')
        console.log(err)
    })
