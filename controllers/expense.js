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

        let sum = calculateSum(expenses)
        sum = roundToTwo(sum)
        const comparison = calculateComparison(expenses)
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

const calculateComparison = (expenses) => {
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
    usersColors = extractNameAndColor(expenses, 'payer.username', 'payer.color')

    //Ustvarim uporabnike glede na zbrane zgoraj
    usersColors.forEach(function (user) {
        let newUser = []
        if (user === 'Revolut') {
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
            if (user.name !== 'Revolut') {
                sumForCalculation += user.sumOfExpenses
            }
            activeUsers = usersObject.filter((user) => user.name !== 'Revolut')
        })
        perUser = sumForCalculation / 2

        if (activeUsers.length > 1) {
            if (activeUsers[0].sumOfExpenses - perUser >= 0) {
                message = `${
                    activeUsers[1].name
                } dolguje ${activeUsers[0].name.replace(
                    /.$/,
                    'i'
                )}: €${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )}`
            } else {
                message = `${
                    activeUsers[0].name
                } dolguje ${activeUsers[1].name.replace(
                    /.$/,
                    'i'
                )}: €${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )}`
            }
        } else if (activeUsers.length === 1) {
            if (activeUsers.name === 'Miha') {
                message = `Nataša dolguje Mihi: €${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )}`
            } else {
                message = `Miha dolguje Nataši: €${Math.abs(
                    roundToTwo(activeUsers[0].sumOfExpenses - perUser)
                )}`
            }
        } else {
            message = 'Stroški poravnani!'
        }
    }
    return {
        message,
        usersObject,
        parentCategoriesObject,
    }
}
