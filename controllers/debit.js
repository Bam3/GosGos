var CronJob = require('cron').CronJob
const User = require('../models/user')
const Debit = require('../models/debit')
const Expense = require('../models/expense')
//  ┌────────────── second (0 - 59) (optional)
//  │ ┌──────────── minute (0 - 59)
//  │ │ ┌────────── hour (0 - 23)
//  │ │ │ ┌──────── day of the month (1 - 31)
//  │ │ │ │ ┌────── month (1 - 12)
//  │ │ │ │ │ ┌──── day of the week (0 - 6) (0 and 7 both represent Sunday)
//  │ │ │ │ │ │
//  │ │ │ │ │ │
//  * * * * * *

var job = new CronJob(
    '18 * * * * *',
    function () {
        console.log('You will see this message every second')
    },
    null,
    false,
    'Europe/Ljubljana'
)

module.exports.createCronJobs = async (debits) => {
    let running = debits.forEach((debit) => {
        new CronJob(
            `${debit.debitInputDayInMonth} * * * * *`,
            async () => {
                console.log(debit, running)
                // const newExpense = new Expense({
                //     cost: debit.cost,
                //     payer: debit.debitOwner.id,
                //     payDate: new Date(now),
                //     description: debit.description,
                //     category: debit.category.id,
                //     shared: Boolean(debit.shared),
                //     household: debit.household,
                // })
                // await newExpense.save()
            },
            null,
            debit.enable,
            'Europe/Ljubljana'
        )
    })
}

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
    return debits
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
module.exports.getDebitContext = async (req, res) => {
    let debit = await Debit.findById(req.params.id).populate({
        path: 'category',
        populate: {
            path: 'parentCategory',
        },
    })
    return { debit }
}
module.exports.updateDebit = async (req, res) => {
    const { id } = req.params
    if (!req.body.debit.shared) {
        req.body.debit.shared = 'false'
    }
    if (!req.body.debit.enable) {
        req.body.debit.enable = 'false'
    }
    const debit = await Debit.findByIdAndUpdate(id, {
        ...req.body.debit,
    })
    req.flash('success', 'Uspešno posodobljen trajnik!')
    res.redirect(`/debits`)
}
