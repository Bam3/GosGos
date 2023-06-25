const category = require('../models/category')
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
    let categories = await Category.find({
        $or: [{ _id: id }, { parentCategory: id }],
    })
    //what is parent category
    const parentCategory = categories.filter(
        (category) => !category.parentCategory
    )
    //what are the categories
    categories = categories.filter((category) => category.parentCategory)

    return { categories, parentCategory }
}
module.exports.getCategoriesToEdit = (req, res) => {
    let catss = []
    for (let i = 0; i < req.body.subCategories.length; i++) {
        catss.push({
            name: req.body.subCategories[i],
            id: req.body.subCategoriesId[i],
        })
    }
    return {
        parentCategory: req.body.name,
        parentId: req.body.id,
        parentColor: req.body.color,
        subCats: catss,
    }
}
module.exports.updateCategoriesOrCreate = async (
    req,
    res,
    categoriesObject
) => {
    await Category.findByIdAndUpdate(categoriesObject.parentId, {
        name: categoriesObject.parentCategory,
        color: categoriesObject.parentColor,
    })
    categoriesObject.subCats.map(async (subCategory) => {
        if (subCategory.id !== undefined) {
            await Category.findByIdAndUpdate(subCategory.id, {
                name: subCategory.name,
            })
        } else {
            const newSubCategory = new Category({
                name: subCategory.name,
                household: req.session.household,
                parentCategory: categoriesObject.parentId,
            })
            await newSubCategory.save()
        }
    })
}
