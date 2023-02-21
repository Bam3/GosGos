if (process.env.NODE_ENV !== 'production') {
    //s tem rečemo naj pogleda naš .env fajl in ga upošteva, ampak samo ko svmo v dev.
    require('dotenv').config()
}

const { request } = require('express')
const mongoose = require('mongoose')
const { seedCategories } = require('./category')
const { seedExpenses } = require('./expense')
const {
    seedHouseholds,
    cosnoleAllHouses,
    changeAllUsers,
} = require('./household')
const { seedUsers } = require('./user')
const { seedWhiskies } = require('./whiskey')

//local DB
const dbUrl = 'mongodb://localhost:27017/gos-gos'
//const dbUrl = process.env.DB_URL
mongoose
    .connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async (client) => {
        //await seedUsers()
        //await seedCategories()
        //await seedExpenses()
        //await seedWhiskies()
        await seedHouseholds()
        await cosnoleAllHouses()
        await changeAllUsers()

        await client.disconnect()
    })
    .catch((err) => {
        console.log('Mongo connection error!')
        console.log(err)
    })
