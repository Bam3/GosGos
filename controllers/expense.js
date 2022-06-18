const Category = require('../models/category')
const User = require('../models/user')

module.exports.getNewExpenseContext = async function () {
    const categories = await Category.find({}).populate('subCategories')
    const users = await User.find({})
    const parentCategories = categories.filter(
        (category) => category.parentCategory === undefined
    )

    return { categories: parentCategories, users }
}
