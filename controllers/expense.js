const Category = require('../models/category')

module.exports.getNewExpenseContext = async function () {
    const categories = await Category.find({}).populate('subCategories')

    const parentCategories = categories.filter(
        (category) => category.parentCategory === undefined
    )

    return { categories: parentCategories }
}
