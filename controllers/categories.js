const _ = require('lodash')
const Category = require('../models/category')
const Expense = require('../models/expense')

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
        (category) => !category.parentCategory,
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
                id: req.body.subCategoriesId?.[i],
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
    categoriesObject,
) => {
    // Update category name and color
    const parentCategory = await Category.findByIdAndUpdate(
        categoriesObject.parentId,
        {
            name: categoriesObject.parentCategory,
            color: categoriesObject.parentColor,
        },
    ).populate('subCategories')

    // Mark all existing subcategories for deletion
    let subcategoryIdsToDelete = parentCategory.subCategories.map(
        (subcategory) => subcategory.id,
    )

    categoriesObject.subCats.forEach(async (subCategory) => {
        if (subCategory.id !== undefined) {
            // If a subcategory id exists in the posted subcategories, it's
            // still valid, so remove it from the ones marked for deletion
            subcategoryIdsToDelete = subcategoryIdsToDelete.filter(
                (id) => id !== subCategory.id,
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

    if (subcategoryIdsToDelete.length > 0) {
        // Delete any old subcategories that should no longer exist
        await Category.deleteMany({ _id: { $in: subcategoryIdsToDelete } })
        // Delete expenses belonging to deleted categories
        await Expense.deleteMany({ category: { $in: subcategoryIdsToDelete } })
    }
}
module.exports.getPopularCategories = async (req) => {
    const householdId = req.session.household

    const topCategories = await Expense.aggregate([
        // Filter down to only expenses for the given household
        { $match: { $expr: { household: householdId } } },

        // Group them by category and calculate counts
        { $group: { _id: '$category', count: { $sum: 1 } } },

        // Sort by count descending
        { $sort: { count: -1 } },

        // Limit to top 5 results
        { $limit: 5 },

        // Do a subquery to get full category
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category',
            },
        },

        // Unwind resulting category from array
        { $unwind: { path: '$category' } },

        // Replace the root object with category
        { $replaceRoot: { newRoot: "$category" } }
    ])

    return topCategories
}
