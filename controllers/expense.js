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
    }).populate('subCategories')
    const users = await User.find({ household: req.session.household })
    const parentCategories = categories.filter(
        (category) => category.parentCategory === undefined
    )
    return {
        categories: parentCategories,
        users,
    }
}

module.exports.updateExpense = async (req, res) => {
    const { id } = req.params
    if (!req.body.expense.shared) {
        req.body.expense.shared = 'false'
    }
    const expense = await Expense.findByIdAndUpdate(id, {
        ...req.body.expense,
    })
    req.flash('success', 'Uspešno posodobljen strošek!')
    res.redirect(`/expenses/${expense._id}`)
}

module.exports.createExpense = async (req, res) => {
    const newExpense = new Expense({
        cost: req.body.price,
        payer: req.body.user,
        payDate: new Date(req.body.payDate),
        description: req.body.description,
        category: req.body.category,
        shared: Boolean(req.body.shared),
        household: req.session.household,
    })
    await newExpense.save()

    return newExpense
}

module.exports.getExpenseContext = async (req, res, filter) => {
    let filterObject = {}
    let expenses = {}
    //če podamo filter datuma, od - do
    if (filter !== undefined) {
        filterObject = {
            household: req.session.household,
            payDate: {
                $gte: new Date(filter.from),
                $lte: new Date(filter.to),
            },
            shared: filter.share,
        }

        expenses = await Expense.find(filterObject)
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
                const neki = await generateCategoryLabel(expense.category)
                expense.categoryLabel = neki
            })
        )
        if (filter.share === 'false') {
            expenses = extractExpensesByUser(
                expenses,
                req.session.passport.user
            )
        }

        let sum = calculateSum(
            expenses,
            String(filter.share).toLowerCase() === 'true'
        )
        sum = roundToTwo(sum)
        const comparison = calculateComparison(req, expenses)
        return {
            expenses,
            sum,
            filter,
            comparison,
        }
        // če želimo filtriratio po id-ju
    } else if (req.params.id) {
        expenses = await Expense.findById(req.params.id)
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
        if (expenses) {
            const neki = await generateCategoryLabel(expenses.category)
            expenses.categoryLabel = neki
            return {
                expenses,
            }
        } else {
            return undefined
        }
    }
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
        const secondUser = expensesByUser[1].name
        const differenceOwed = roundToTwo(expensesByUser[0].sumOfPayments - sharePerUser)

        if (expensesByUser.length > 1) {
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

module.exports.getLastExpanses = async (req, res) => {
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
    let sharedExpenses = await filterLastExpanses(filterObject, 10)
    let usersExpenses = await filterLastExpanses(filterObjectUser, 5)

    return { sharedExpenses, usersExpenses }
}

const filterLastExpanses = async (filterObject, limit = 10) => {
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
