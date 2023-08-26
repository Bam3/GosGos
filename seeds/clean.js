const Expense = require('../models/expense')

module.exports.cleanFaildJobs = async () => {
    try {
        const result = await Expense.deleteMany({ description: '1' })
        console.log(result)
    }
    catch (error) {
        console.log(error)
    }
}
