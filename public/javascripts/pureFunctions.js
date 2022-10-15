var _ = require('lodash')

module.exports.calculateSum = (expenses) => {
    sum = 0
    for (const expense of expenses) {
        if (expense.shared) {
            sum = sum + expense.cost
        }
    }
    return sum
}

module.exports.roundToTwo = (num) => {
    return Number(Math.round(num + 'e2') + 'e-2')
}

//funkcija prečisti array tako da ostanejo samo unikati,
//argumenta sta array objektov in properti katerega iščemo.
module.exports.extractFrom = (arrayOfObjects, property) => {
    let output = []
    arrayOfObjects.map((object) => {
        output.push(_.get(object, property))
    })
    return [...new Set(output)]
}

module.exports.updateUserClass = (expenses, usersObject, property) => {
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
        user.numberOfPayments = user.numberOfExpenses
        user.payments = [user.sumOfExpenses]
    })
    // sort by numberOfPayments
    usersObject.sort((a, b) => b.numberOfPayments - a.numberOfPayments)
}

module.exports.generateCategoryLabel = async (category) => {
    if (category.parentCategory) {
        await category.populate('parentCategory')
        return `${category.parentCategory.name} - ${category.name}`
    } else {
        return category.name
    }
}
