const Category = require('../models/category')
const Expense = require('../models/expense')
const User = require('../models/user')

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
    if (filter.from && filter.to) {
        filterObject = {
            payDate: {
                $gte: new Date(filter.from).toISOString(),
                $lte: new Date(filter.to).toISOString(),
            },
        }
    }

    const expenses = await Expense.find(filterObject)
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
    return sum
}

const calculateComparison = (expenses) => {
    let users = []
    let usersPayments = [0, 0]
    let textOutput = ''
    //pojdem čez vse stroške in pregledam userje
    expenses.map((expense) => {
        users.push(expense.payer.username)
    })
    //ponavljajoče odstrnaim tako, da dobim vse uporabnike
    users = [...new Set(users)]

    for (const expense of expenses) {
        if (expense.shared) {
            if (expense.payer.username === users[0]) {
                usersPayments[0] = usersPayments[0] + expense.cost
            } else {
                usersPayments[1] = usersPayments[1] + expense.cost
            }
        }
    }
    let perUser =
        usersPayments[0] -
        (usersPayments[0] + usersPayments[1]) / usersPayments.length

    if (perUser < 0) {
        textOutput = `${users[0]} dolguje ${users[1]}: ${Math.abs(perUser)} €`
    } else {
        textOutput = `${users[1]} dolguje ${users[0]}: ${Math.abs(perUser)} €`
    }

    for (const expense of expenses) {
        if (expense.shared) {
        }
    }
    return { users, usersPayments, perUser, textOutput }
}
