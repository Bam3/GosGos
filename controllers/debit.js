let cron = require('node-cron')
const User = require('../models/user')
const Debit = require('../models/debit')
//  ┌────────────── second (0 - 59) (optional)
//  │ ┌──────────── minute (0 - 59)
//  │ │ ┌────────── hour (0 - 23)
//  │ │ │ ┌──────── day of the month (1 - 31)
//  │ │ │ │ ┌────── month (1 - 12)
//  │ │ │ │ │ ┌──── day of the week (0 - 6) (0 and 7 both represent Sunday)
//  │ │ │ │ │ │
//  │ │ │ │ │ │
//  * * * * * *
cron.schedule(
    '* * * * *',
    async () => {
        const date = new Date()
        //get all users in db
        let allUsers = await User.find({})
        console.log(`Število vseh uporabnikov je: ${allUsers.length}`)

        //console.log(
        //    `Ta task se izvaja vsako minuto - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        //)
    },
    {
        scheduled: false,
        timezone: 'Europe/Ljubljana',
        recoverMissedExecutions: false,
    }
)

module.exports.getAllDebites = async (req, res) => {
    const debits = await Debit.find({ debitOwner: req.session.usersID })
        .populate({
            path: 'category',
            populate: {
                path: 'parentCategory',
            },
        })
        .populate({
            path: 'debitOwner',
        })
    return { debits }
}

module.exports.createDebit = async (req, res) => {
    const newDebit = new Debit({
        debitOwner: req.session.usersID,
        cost: req.body.price,
        description: req.body.description,
        category: req.body.category,
        shared: Boolean(req.body.shared),
        household: req.session.household,
        enable: Boolean(req.body.enable),
        debitInputDayInMonth: req.body.payDay,
    })
    await newDebit.save()

    return newDebit
}
