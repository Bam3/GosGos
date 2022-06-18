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

module.exports.getExpenseContext = async () => {
    const expenses = await Expense.find()
        .sort({ payDate: -1 })
        .populate(['category', 'payer'])
    let sum = 0
    for (const expense of expenses) {
        sum = sum + expense.cost
    }
    await Promise.all(
        expenses.map(async (expense) => {
            const neki = await generateCategoryLabel(expense.category)
            expense.categoryLabel = neki
        })
    )
    console.log(expenses)
    return { expenses, sum }
}

const generateCategoryLabel = async (category) => {
    if (category.parentCategory) {
        await category.populate('parentCategory')
        return `${category.parentCategory.name} - ${category.name}`
    } else {
        return category.name
    }
}
