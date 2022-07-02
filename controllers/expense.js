const Category = require('../models/category')
const Expense = require('../models/expense')
const User = require('../models/user')
const userObject = require('../public/javascripts/Classes')

module.exports.getNewExpenseContext = async () => {
    const categories = await Category.find({}).populate('subCategories')
    const users = await User.find({})
    const parentCategories = categories.filter(
        (category) => category.parentCategory === undefined
    )

    return { categories: parentCategories, users }
}

module.exports.createExpense = async (reqBody) => {
    const newExpense = new Expense({
        cost: reqBody.price,
        //tukaj dodaj trenutno prijavljenega uporabnika, ko boš naredil uporabnike in session!
        payer: reqBody.user,
        payDate: new Date(reqBody.payDate),
        description: reqBody.description,
        category: reqBody.category,
        shared: Boolean(reqBody.shared),
    })
    await newExpense.save()

    return newExpense
}

module.exports.getExpenseContext = async (filter) => {
    let filterObject = {}
    let expenses = {}
    //če podamo filter datuma, od - do
    if (filter.from && filter.to) {
        filterObject = {
            payDate: {
                $gte: new Date(filter.from).toISOString(),
                $lte: new Date(filter.to).toISOString(),
            },
        }
        expenses = await Expense.find(filterObject)
            .sort({ payDate: -1 })
            .populate(['category', 'payer'])

        await Promise.all(
            expenses.map(async (expense) => {
                const neki = await generateCategoryLabel(expense.category)
                expense.categoryLabel = neki
            })
        )
        const sum = calculateSum(expenses)
        const comparison = calculateComparison(expenses)
        return { expenses, sum, filter, comparison }
        // če želimo filtriratio po id-ju
    } else if (filter.id) {
        expenses = await Expense.findById(filter.id).populate([
            'category',
            'payer',
        ])
        if (expenses) {
            const neki = await generateCategoryLabel(expenses.category)
            expenses.categoryLabel = neki
            return { expenses }
        } else {
            return undefined
        }
    }
}

const generateCategoryLabel = async (category) => {
    if (category.parentCategory) {
        await category.populate('parentCategory')
        return `${category.parentCategory.name} - ${category.name}`
    } else {
        return category.name
    }
}

const calculateSum = (expenses) => {
    sum = 0
    for (const expense of expenses) {
        if (expense.shared) {
            sum = sum + expense.cost
        }
    }
    return roundToTwo(sum)
}

const calculateComparison = (expenses) => {
    let users = []
    let textOutput = ''
    let usersObject = []
    let sumForCalculation = 0
    let activeUsers = []
    let perUser = 0

    //pojdem čez vse stroške in pregledam userje
    expenses.map((expense) => {
        users.push(expense.payer.username)
    })

    //ponavljajoče odstrnaim tako, da dobim vse uporabnike
    users = [...new Set(users)]

    //Ustvarim uporabnike glede na zbrane zgoraj
    users.forEach(function (user) {
        let newUser = []
        if (user === 'Revolut') {
            newUser = new userObject(user, [], false)
        } else {
            newUser = new userObject(user, [], true)
        }
        usersObject.push(newUser)
    })
    // če so users prazni pomeni da nimamo izračuna, ker ni stroškov
    if (usersObject.length !== 0) {
        //vsem zapišem kaj so plačali
        expenses.forEach(function (expense) {
            usersObject.forEach(function (user) {
                if (expense.shared) {
                    if (expense.payer.username === user.name) {
                        user.payments.push(expense.cost)
                    }
                }
            })
        })
        usersObject.forEach(function (user) {
            if (user.name !== 'Revolut') {
                sumForCalculation += user.sumOfExpenses
            }
            activeUsers = usersObject.filter((user) => user.name !== 'Revolut')
        })
        perUser = sumForCalculation / 2

        if (activeUsers.length > 1) {
            if (activeUsers[0].sumOfExpenses - perUser >= 0) {
                textOutput = `${
                    activeUsers[1].name
                } dolguje ${activeUsers[0].name.replace(/.$/, 'i')}: ${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )} €`
            } else {
                textOutput = `${
                    activeUsers[0].name
                } dolguje ${activeUsers[1].name.replace(/.$/, 'i')}: ${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )} €`
            }
        } else if (activeUsers.length === 1) {
            if (activeUsers.name === 'Miha') {
                textOutput = `Nataša dolguje Mihi: ${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )} €`
            } else {
                textOutput = `Miha dolguje Nataši: ${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )} €`
            }
        } else {
            textOutput = 'Stroški poravnani!'
        }
    }
    return { users, perUser, textOutput, usersObject }
}

function roundToTwo(num) {
    return Number(Math.round(num + 'e2') + 'e-2')
}
