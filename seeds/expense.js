const Expense = require('../models/expense')

module.exports.seedExpenses = async () => {
    await Expense.deleteMany({})
}
