const Category = require('../models/category')

module.exports.createCategory = async (category) => {
    const categoryObject = new Category({
        name: category.name,
        color: category.color,
    })
    await categoryObject.save()

    category.subCategories.map(async (subCategory) => {
        const subCategoryObject = new Category({
            name: subCategory,
            parentCategory: categoryObject._id,
        })
        await subCategoryObject.save()
    })
    return categoryObject
}