const Expense = require('../models/expense')

module.exports.cleanFaildJobs = async () => {
    Expense.deleteMany({ description: '1' }, function (err, result) {
        if (err) {
            console.log(err)
        } else {
            console.log(result)
        }
    })
}
