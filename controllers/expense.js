const Category = require('../models/category')
const Expense = require('../models/expense')
const User = require('../models/user')
var _ = require('lodash')
const userObject = require('../public/javascripts/Classes')
const user = require('../models/user')
const {
    populate
} = require('../models/category')

module.exports.getNewExpenseContext = async () => {
    const categories = await Category.find({}).populate('subCategories')
    const users = await User.find({})
    const parentCategories = categories.filter(
        (category) => category.parentCategory === undefined
    )

    return {
        categories: parentCategories,
        users
    }
}

module.exports.updateExpense = async (req, res) => {
    const {
        id
    } = req.params
    console.log(req.body.expense)
    if (!req.body.expense.shared) {
        req.body.expense.shared = 'false'
        console.log(req.body.expense)
    }
    const expense = await Expense.findByIdAndUpdate(id, {
        ...req.body.expense
    })
    req.flash('success', 'Uspešno posodobljen strošek!')
    res.redirect(`/expenses/${expense._id}`)
}

module.exports.createExpense = async (reqBody) => {
    const newExpense = new Expense({
        cost: reqBody.price,
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
    let expensesAggregate = {}
    //če podamo filter datuma, od - do
    if (filter.from && filter.to) {
        filterObject = {
            payDate: {
                $gte: new Date(filter.from),
                $lte: new Date(filter.to),
            },
        }

        expensesAggregate = await Expense.aggregate([{
                $match: {
                    payDate: {
                        $gte: new Date(filter.from),
                        $lte: new Date(filter.to),
                    },
                },
            },
            {
                $group: {
                    _id: '$category',
                    sum: {
                        $sum: '$cost'
                    },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'cat',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'cat[0].parentCategory',
                    foreignField: '_id',
                    as: 'ParentCat',
                },
            },
        ])

        console.log(expensesAggregate[1])

        expenses = await Expense.find(filterObject)
            .sort({
                payDate: -1
            })
            .populate({
                path: 'category',
                populate: {
                    path: 'parentCategory',
                },
            })
            .populate('payer')

        console.log(expenses[0])

        await Promise.all(
            expenses.map(async (expense) => {
                const neki = await generateCategoryLabel(expense.category)
                expense.categoryLabel = neki
            })
        )

        const sum = calculateSum(expenses)
        const comparison = calculateComparison(expenses)
        return {
            expenses,
            sum,
            filter,
            comparison
        }
        // če želimo filtriratio po id-ju
    } else if (filter.id) {
        expenses = await Expense.findById(filter.id).populate([
            'category',
            'payer',
        ])
        if (expenses) {
            const neki = await generateCategoryLabel(expenses.category)
            expenses.categoryLabel = neki
            return {
                expenses
            }
        } else {
            return undefined
        }
    }
}

module.exports.deleteExpense = async (req, res) => {
    const {
        id
    } = req.params
    await Expense.findByIdAndDelete(id)
    req.flash('success', 'Uspešno izbrisan strošek!')
    res.redirect('/expenses')
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
    let usersColor = []
    let textOutput = ''
    let usersObject = []
    let parentCategoriesObject = []
    let sumForCalculation = 0
    let activeUsers = []
    let perUser = 0
    let parentCategories = []
    let categoriesColor = []

    //pojdem čez stroške in izločim vse glavne kategorije
    parentCategories = extractFrom(expenses, 'category.parentCategory.name')
    categoriesColor = extractFrom(expenses, 'category.parentCategory.color')

    //ustvarimo kategorije glede na filtriranje zgoraj
    parentCategories.forEach(function (category) {
        let newCategory = []
        newCategory = new userObject(category, [], false)
        parentCategoriesObject.push(newCategory)
    })

    //pojdem čez vse stroške in izločim vse uporabnike
    users = extractFrom(expenses, 'payer.username')
    usersColor = extractFrom(expenses, 'payer.color')

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
    // če so users prazni pomeni, da nimamo izračuna, ker ni stroškov
    if (usersObject.length !== 0) {
        // za vse parent kategorije zapišemo koliko je vosta stroškov
        updateUserClass(
            expenses,
            parentCategoriesObject,
            'category.parentCategory.name'
        )

        //vsem zapišem kaj so plačali
        updateUserClass(expenses, usersObject, 'payer.username')

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
    return {
        users,
        perUser,
        textOutput,
        usersObject,
        parentCategoriesObject,
        usersColor,
        categoriesColor,
    }
}

function roundToTwo(num) {
    return Number(Math.round(num + 'e2') + 'e-2')
}

//funkcija prečisti array tako da ostanejo samo unikati,
//argumenta sta array objektov in properti katerega iščemo.
function extractFrom(arrayOfObjects, property) {
    let output = []
    arrayOfObjects.map((object) => {
        output.push(_.get(object, property))
    })
    return [...new Set(output)]
}

function updateUserClass(expenses, usersObject, property) {
    expenses.forEach(function (expense) {
        usersObject.forEach(function (user) {
            if (expense.shared) {
                if (_.get(expense, property) === user.name) {
                    user.payments.push(expense.cost)
                }
            }
        })
    })
    usersObject.forEach(function (user) {
        user.payments = [user.sumOfExpenses]
    })
}