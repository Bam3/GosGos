const Category = require('../models/category')
const Expense = require('../models/expense')
const User = require('../models/user')
const UserOrCategoryObject = require('../public/javascripts/Classes')
const {
    calculateSum,
    roundToTwo,
    extractNameAndColor,
    updateUserOrCategoryClass,
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
    let usersColors = []
    let message = ''
    let usersObject = []
    let parentCategoriesObject = []
    let sumForCalculation = 0
    let activeUsers = []
    let perUser = 0
    let parentCategoriesColors = []

    //pojdem čez stroške in izločim vse glavne kategorije
    parentCategoriesColors = extractNameAndColor(
        expenses,
        'category.parentCategory.name',
        'category.parentCategory.color'
    )

    //ustvarimo kategorije glede na filtriranje zgoraj
    parentCategoriesColors.forEach(function (category) {
        let newCategory = new UserOrCategoryObject(
            category.name,
            [],
            false,
            category.color
        )
        parentCategoriesObject.push(newCategory)
    })

    //pojdem čez vse stroške in izločim vse uporabnike
    usersColors = extractNameAndColor(
        expenses,
        'payer.username',
        'payer.color',
        'payer.roll'
    )
    //Ustvarim uporabnike glede na zbrane zgoraj
    usersColors.forEach(function (user) {
        let newUser = []
        if (user.roll === 'shared') {
            newUser = new UserOrCategoryObject(user.name, [], false, user.color)
        } else {
            newUser = new UserOrCategoryObject(user.name, [], true, user.color)
        }
        usersObject.push(newUser)
    })
    // če so users prazni pomeni, da nimamo izračuna, ker ni stroškov
    if (usersObject.length !== 0) {
        // za vse parent kategorije zapišemo koliko je vosta stroškov
        updateUserOrCategoryClass(
            expenses,
            parentCategoriesObject,
            'category.parentCategory.name'
        )
        //vsem zapišem kaj so plačali
        updateUserOrCategoryClass(expenses, usersObject, 'payer.username')

        //seštejemo vse stroške po uporabnikih
        usersObject.forEach(function (user) {
            if (user.inCalculation) {
                sumForCalculation += user.sumOfExpenses
            }
        })
        activeUsers = usersObject.filter((user) => user.inCalculation)
        perUser = sumForCalculation / 2

        if (activeUsers.length > 1) {
            if (activeUsers[0].sumOfExpenses - perUser >= 0) {
                message = `${activeUsers[1].name} owes ${
                    activeUsers[0].name
                }: €${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )}`
            } else {
                message = `${activeUsers[0].name} owes ${
                    activeUsers[1].name
                }: €${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )}`
            }
        } else if (activeUsers.length === 1) {
            if (activeUsers[0].name === req.session.passport.user) {
                message = `Owes you: €${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )}`
            } else {
                message = `You owes: €${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )}`
            }
        } else {
            message = 'Fair and square!'
        }
    }
    return {
        message,
        usersObject,
        parentCategoriesObject,
    }
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
