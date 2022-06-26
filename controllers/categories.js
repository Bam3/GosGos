const Category = require('../models/category')

// category = {
//     name: 'Dom',
//     subCategories: ['Elektrika', 'Plin', 'Komunala'],
// }
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
