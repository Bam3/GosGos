var _ = require('lodash')
const payerUtils = require('../../utils/payers')

module.exports.calculateSum = (expenses, shared = true) => {
    sum = 0
    for (const expense of expenses) {
        if (shared) {
            if (expense.shared) {
                sum = sum + expense.cost
            }
        } else {
            if (!expense.shared) {
                sum = sum + expense.cost
            }
        }
    }
    return sum
}
module.exports.roundToTwo = (num) => _.round(num, 2)

function addExpenseToGroups(groups, name, color, cost) {
    // See if we already have this category/user in `groups`
    const existing = groups[name]

    if (existing) {
        // This category/user is already tracked, update the existing one
        existing.numberOfPayments++
        existing.sumOfPayments += cost
    } else {
        // This category/user is new, create it from scratch
        groups[name] = {
            name: name,
            color: color,
            numberOfPayments: 1,
            sumOfPayments: cost,
        }
    }
}

module.exports.groupExpensesByUser = function (expenses) {
    const userGroups = {}

    expenses.forEach((expense) => {
        // We need to repeat the process for each payer because shared expenses
        // need to be split.
        expense.payers.forEach((payer) => {
            const name = payer.username
            const color = payer.color
            // Evenly split the cost among all payers
            const cost = expense.cost / expense.payers.length
            addExpenseToGroups(userGroups, name, color, cost)
        })
    })

    const listOfUserGroups = Object.values(userGroups)

    // Sort users by `sumOfPayments` because we want the one who paid the most
    // to be first
    listOfUserGroups.sort((a, b) => b.sumOfPayments - a.sumOfPayments)

    return listOfUserGroups
}

module.exports.groupExpensesByCategory = function (expenses) {
    const categoryGroups = {}

    expenses.forEach((expense) => {
        const name =
            expense.category.parentCategory?.name ?? expense.category.name
        const color =
            expense.category.parentCategory?.color ?? expense.category.color
        const cost = expense.cost
        addExpenseToGroups(categoryGroups, name, color, cost)
    })

    const listOfCategoryGroups = Object.values(categoryGroups)

    // Sort categories by `numberOfPayments` because we want to list the ones
    // with most expenses at the beginning
    listOfCategoryGroups.sort((a, b) => b.numberOfPayments - a.numberOfPayments)

    return listOfCategoryGroups
}
module.exports.generateCategoryLabel = async (category) => {
    if (category.parentCategory) {
        await category.populate('parentCategory')
        return `${category.parentCategory.name} - ${category.name}`
    } else {
        return category.name
    }
}
module.exports.extractExpensesByUser = (expenses, user) => {
    let extrectedExpanses = []
    expenses.forEach((expense) => {
        if (expense.payer.username === user) {
            extrectedExpanses.push(expense)
        }
    })
    return extrectedExpanses
}
