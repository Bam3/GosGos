const Category = require('../models/category')

module.exports.createCategory = async (category) => {
    const categoryObject = new Category({ name: category.name })
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

module.exports.getCategoriesContext = async () => {
    const categories = await Category.find({}).populate('parentCategory')
    return { categories }
}
