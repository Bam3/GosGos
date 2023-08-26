const Category = require('../models/category')

module.exports.createCategory = async (req) => {
    const category = req.body
    const categoryObject = new Category({
        name: category.name,
        color: category.color,
        household: req.session.household,
    })
    await categoryObject.save()

    category.subCategories?.map(async (subCategory) => {
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
    let subCategories = []

    // Check if there are any subcategories before trying to loop through
    const subCategoriesExist = Boolean(req.body.subCategories)

    if (subCategoriesExist) {
        for (let i = 0; i < req.body.subCategories.length; i++) {
            subCategories.push({
                name: req.body.subCategories[i],
                // Check if subCategoriesId exists - it might not if all the
                // subcategories are newly added in this edit.
                id: req.body.subCategoriesId?.[i]
            })
        }
    }

    return {
        parentCategory: req.body.name,
        parentId: req.body.id,
        parentColor: req.body.color,
        subCats: subCategories,
    }
}
module.exports.updateCategoriesOrCreate = async (
    req,
    res,
    categoriesObject
) => {
    // Update category name and color
    const parentCategory = await Category.findByIdAndUpdate(
        categoriesObject.parentId,
        {
            name: categoriesObject.parentCategory,
            color: categoriesObject.parentColor,
        }
    ).populate('subCategories')

    // Mark all existing subcategories for deletion
    let subcategoryIdsToDelete = parentCategory.subCategories.map(
        (subcategory) => subcategory.id
    )

    categoriesObject.subCats.forEach(async (subCategory) => {
        if (subCategory.id !== undefined) {
            // If a subcategory id exists in the posted subcategories, it's
            // still valid, so remove it from the ones marked for deletion
            subcategoryIdsToDelete = subcategoryIdsToDelete.filter(
                id => id !== subCategory.id
            )

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

    // Delete any old subcategories that should no longer exist
    await Category.deleteMany({_id: {$in: subcategoryIdsToDelete}})
}
