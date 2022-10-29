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
module.exports.extractNameAndColor = (
    arrayOfObjects,
    propertyName,
    propertyColor
) => {
    let nameAndColor = {}
    let allNamesAndColors = []
    arrayOfObjects.map((object) => {
        nameAndColor.name = _.get(object, propertyName)
        nameAndColor.color = _.get(object, propertyColor)
        allNamesAndColors.push(nameAndColor)
        nameAndColor = {}
    })
    //get unique
    var resArr = []
    allNamesAndColors.filter(function (item) {
        var i = resArr.findIndex(
            (x) => x.name == item.name && x.color == item.color
        )
        if (i <= -1) {
            resArr.push(item)
        }
        return null
    })
    return resArr
}

module.exports.updateUserOrCategoryClass = (
    expenses,
    usersObject,
    property
) => {
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
