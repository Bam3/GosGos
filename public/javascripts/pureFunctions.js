var _ = require('lodash')

module.exports.roundToTwo = (num) => _.round(num, 2)

function addExpenseToGroups(groups, id, name, color, cost) {
    // See if we already have this category/user in `groups`
    const existing = groups[name]

    if (existing) {
        // This category/user is already tracked, update the existing one
        existing.numberOfPayments++
        existing.sumOfPayments += cost
    } else {
        // This category/user is new, create it from scratch
        groups[name] = {
            id: id,
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
            const id = payer.id
            const name = payer.username
            const color = payer.color
            // Evenly split the cost among all payers
            const cost = expense.cost / expense.payers.length
            addExpenseToGroups(userGroups, id, name, color, cost)
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
        const id = expense.category.parentCategory?.id ?? expense.category.id
        const name =
            expense.category.parentCategory?.name ?? expense.category.name
        const color =
            expense.category.parentCategory?.color ?? expense.category.color
        const cost = expense.cost
        addExpenseToGroups(categoryGroups, id, name, color, cost)
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
module.exports.getLastMonthStartEndDate = function (
    refDate = new Date().toISOString(),
) {
    let currentDate = refDate.split('-')
    let prevDateS = []
    let prevDateE = []
    //check if in january
    if (currentDate[1] === '01') {
        prevDateS[1] = '12'
        prevDateE[1] = '12'
        prevDateS[0] = String(parseInt(currentDate[0]) - 1)
        prevDateE[0] = String(parseInt(currentDate[0]) - 1)
    } else {
        if (parseInt(currentDate[1]) - 1 <= 9) {
            prevDateS[1] = parseInt(currentDate[1]) - 1
            prevDateS[1] = String(prevDateS[1]).padStart(2, '0')
            prevDateE[1] = prevDateS[1]
        } else {
            prevDateS[1] = parseInt(currentDate[1]) - 1
            prevDateE[1] = prevDateS[1]
        }
        prevDateS[0] = currentDate[0]
        prevDateE[0] = currentDate[0]
    }
    //Day
    prevDateS[2] = '01'
    prevDateE[2] = new Date(
        parseInt(prevDateS[0]),
        parseInt(prevDateS[1]),
        0,
    ).getDate()
    return { from: prevDateS.join('-'), to: prevDateE.join('-') }
}
