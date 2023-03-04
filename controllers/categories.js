const Category = require('../models/category')

module.exports.createCategory = async (req) => {
    const category = req.body
    const categoryObject = new Category({
        name: category.name,
        color: category.color,
        household: req.session.household,
    })
    await categoryObject.save()

    category.subCategories.map(async (subCategory) => {
        const subCategoryObject = new Category({
            name: subCategory,
            household: req.session.household,
            parentCategory: categoryObject._id,
        })
        await subCategoryObject.save()
    })
    return categoryObject
}

module.exports.getCategory = async (req, res, id) => {
    const categories = await Category.find({
        $or: [{ _id: id }, { parentCategory: id }],
    })

    return categories
}
