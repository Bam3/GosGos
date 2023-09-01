const Category = require('../models/category')
const Expense = require('../models/expense')
const User = require('../models/user')
const {
    calculateSum,
    roundToTwo,
    groupExpensesByUserOrCategory,
    generateCategoryLabel,
    extractExpensesByUser,
} = require('../public/javascripts/pureFunctions')

module.exports.getAllCategoriesAndUsers = async (req, res) => {
    const categories = await Category.find({
        household: req.session.household,
        parentCategory: null,
    }).populate('subCategories')
    const users = await User.find({ household: req.session.household })
    return { categories, users }
}

module.exports.updateExpense = async (req, res) => {
    const { id } = req.params
    const expense = await Expense.findByIdAndUpdate(id, {
        ...req.body.expense,
        shared: Boolean(req.body.expense.shared)
    })
    req.flash('success', 'Uspešno posodobljen strošek!')
    res.redirect(`/expenses/${expense._id}`)
}

module.exports.createExpense = async (req, res) => {
    const newExpense = new Expense({
        ...req.body.expense,
        household: req.session.household,
        shared: Boolean(req.body.expense.shared)
    })
    await newExpense.save()

    return newExpense
}

module.exports.getExpensesForFilter = async (req, res, filter) => {
    const filterObject = {
        household: req.session.household,
        payDate: {
            $gte: new Date(filter.from),
            $lte: new Date(filter.to),
        },
        shared: filter.share,
    }

    if (filter.share === 'false') {
        const currentUser = await User.find({
            username: req.session.passport.user,
            household: req.session.household,
        })
        filterObject.payer = currentUser
    }

    const expenses = await Expense.find(filterObject)
        .sort({
            payDate: -1,
        })
        .populate({
            path: 'category',
            populate: {
                path: 'parentCategory',
            },
        })
        .populate('payer')

    await Promise.all(
        expenses.map(async (expense) => {
            expense.categoryLabel = await generateCategoryLabel(expense.category)
        })
    )

    let sum = expenses.reduce((sum, expense) => sum + expense.cost, 0)
    sum = roundToTwo(sum)
    const comparison = calculateComparison(req, expenses)
    return {
        expenses,
        sum,
        filter,
        comparison,
    }
}

module.exports.getSingleExpenseById = async (req, res) => {
    const expense = await Expense.findById(req.params.id)
        .populate({
            path: 'category',
            populate: {
                path: 'parentCategory',
            },
        })
        .populate('payer')

    if (expense)
        expense.categoryLabel = await generateCategoryLabel(expense.category)

    return expense
}

module.exports.deleteExpense = async (req, res) => {
    const { id } = req.params
    await Expense.findByIdAndDelete(id)
    req.flash('success', 'Uspešno izbrisan strošek!')
    res.redirect('/expenses')
}

const calculateComparison = (req, expenses) => {
    const expensesByUser = groupExpensesByUserOrCategory(expenses, 'user')
    const expensesByCategory = groupExpensesByUserOrCategory(expenses, 'category')
    let message = ''

    // če so users prazni pomeni, da nimamo izračuna, ker ni stroškov
    if (expensesByUser.length !== 0) {
        const totalExpenses = expensesByUser.reduce((sum, user) => sum += user.sumOfPayments, 0)

        // Note - this should be divided by `expensesByUser.length` if we want
        // to handle households with > 2 people.
        const sharePerUser = totalExpenses / 2

        const userWhoPaidMost = expensesByUser[0].name
        const differenceOwed = roundToTwo(expensesByUser[0].sumOfPayments - sharePerUser)

        if (expensesByUser.length > 1) {
            const secondUser = expensesByUser[1].name
            message = `${secondUser} owes ${userWhoPaidMost} €${differenceOwed}`
        } else if (expensesByUser.length === 1) {
            const youPaidMost = userWhoPaidMost === req.session.passport.user
            message = `You ${youPaidMost ? 'are owed' : 'owe'} ${differenceOwed}`
        } else {
            message = 'Fair and square!'
        }
    }
    return { message, expensesByUser, expensesByCategory }
}

module.exports.getLastExpenses = async (req, res) => {
    let currentUser = await User.find({
        username: req.session.passport.user,
        household: req.session.household,
    })
    let filterObject = {
        household: req.session.household,
        shared: true,
    }
    let filterObjectUser = {
        household: req.session.household,
        shared: false,
        payer: currentUser[0].id,
    }
    let sharedExpenses = await filterLastExpenses(filterObject, 10)
    let usersExpenses = await filterLastExpenses(filterObjectUser, 5)

    return { sharedExpenses, usersExpenses }
}

const filterLastExpenses = async (filterObject, limit = 10) => {
    let expenses = await Expense.find(filterObject)
        .sort({
            payDate: -1,
        })
        .populate({
            path: 'category',
            populate: {
                path: 'parentCategory',
            },
        })
        .populate('payer')
        .limit(limit)

    await Promise.all(
        expenses.map(async (expense) => {
            const neki = await generateCategoryLabel(expense.category)
            expense.categoryLabel = neki
        })
    )
    return expenses
}
