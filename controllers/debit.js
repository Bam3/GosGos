var CronJobManager = require('cron-job-manager')

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
//create manager
let manager = new CronJobManager()
//Every time app restarts all debits in database will create in manager(cronJobManager)
async function createCronManager() {
    let allDebits = await getAllDebits()
    await createCronJobs(allDebits)
}
async function getAllDebits() {
    const debits = await Debit.find()
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
async function createCronJobs(debits) {
    debits.forEach((debit) => {
        manager.add(
            `${debit.id}`,
            `* * * ${debit.debitInputDayInMonth} * *`,
            async () => {
                const newExpense = new Expense({
                    cost: debit.cost,
                    payer: debit.debitOwner.id,
                    payDate: Date.now(),
                    description: debit.description,
                    category: debit.category.id,
                    shared: Boolean(debit.shared),
                    household: debit.household,
                })
                await newExpense.save()
            },
            {
                start: debit.enable,
                timeZone: 'Europe/Ljubljana',
            }
        )
    })
}
createCronManager()

module.exports.getAllLoggedInUserDebits = async (req, res) => {
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
    await newDebit.save(async function (err, result) {
        if (err) {
            req.flash(
                'error',
                'Trajnik ni shranjen in vnešen, poskusi ponovno!'
            )
            res.redirect(`/debits`)
        } else {
            const newDebitId = result.id
            let debit = await Debit.findById(newDebitId)
                .populate({
                    path: 'category',
                    populate: {
                        path: 'parentCategory',
                    },
                })
                .populate({
                    path: 'debitOwner',
                })
            createCronJobs([debit])
        }
    })
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
    let debit = await Debit.findByIdAndUpdate(id, {
        ...req.body.debit,
    })
    //update debit in manager as well
    debit = await Debit.findById(id)
        .populate({
            path: 'category',
            populate: {
                path: 'parentCategory',
            },
        })
        .populate({
            path: 'debitOwner',
        })
    createCronJobs([debit])
    req.flash('success', 'Uspešno posodobljen trajnik!')
    res.redirect(`/debits`)
}
module.exports.deleteDebit = async (req, res) => {
    const { id } = req.params
    await Debit.findByIdAndDelete(id)
    req.flash('success', 'Uspešno izbrisan trajnik!')
    res.redirect('/debits')
}
module.exports.deleteCronJob = async (req, res) => {
    const { id } = req.params
    manager.deleteJob(id)
}
