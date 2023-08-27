var _ = require('lodash')

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
module.exports.groupExpensesByUserOrCategory = (expenses, groupBy) => {
    // Create an object to track groups by user or category name:
    //
    // {
    //   Miha: {
    //     name: 'Miha',
    //     color: '#fafafa',
    //     numberOfPayments: 12,
    //     sumOfPayments: 4533,
    //   },
    //   ... [other user data here]
    // }
    //
    const groups = {}

    expenses.forEach((expense) => {
        // If a shared user paid the expense, just ignore it
        if (groupBy === 'user' && expense.payer.roll === 'shared') return

        // Decide which property to use for name and color
        const name = groupBy === 'user'
            ? expense.payer.username
            : expense.category.parentCategory?.name ?? expense.category.name
        const color = groupBy === 'user'
            ? expense.payer.color
            : expense.category.parentCategory?.color ?? expense.category.color

        // See if we already have this category/user in `groups`
        const existing = groups[name]

        if (existing) {
            // This category/user is already tracked, update the existing one
            existing.numberOfPayments++
            existing.sumOfPayments += expense.cost
        } else {
            // This category/user is new, create it from scratch
            groups[name] = {
                name: name,
                color: color,
                numberOfPayments: 1,
                sumOfPayments: expense.cost,
            }
        }
    })

    const listOfGroups = Object.values(groups)

    if (groupBy === 'user') {
        // Sort users by `sumOfPayments` because we want the one who paid
        // the most to be first
        listOfGroups.sort((a, b) => b.sumOfPayments - a.sumOfPayments)
    } else {
        // Sort categories by `numberOfPayments` because we want to list the
        // ones with most expenses at the beginning
        listOfGroups.sort((a, b) => b.numberOfPayments - a.numberOfPayments)
    }


    return listOfGroups
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
