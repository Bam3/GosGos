const _ = require('lodash')
const { Types } = require('mongoose')
const Category = require('../models/category')
const Expense = require('../models/expense')
const Debit = require('../models/debit')

module.exports.createCategory = async (req) => {
    const category = req.body
    const categoryObject = new Category({
        name: category.name,
        color: category.color,
        active: category.active === 'on' ? true : false,
        household: req.session.household,
    })
    await categoryObject.save()

    category.subCategories?.map(async (subCategory, index) => {
        const subCategoryObject = new Category({
            name: subCategory,
            household: req.session.household,
            active: category.subCategoriesActive[index] === 'on' ? true : false,
            parentCategory: categoryObject._id,
        })
        await subCategoryObject.save()
    })
    return categoryObject
}
module.exports.getCategory = async (req, res, id) => {
    let categories = await Category.find({
        $or: [{ _id: id }, { parentCategory: id }],
        household: req.session.household,
    })
    //what is parent category
    const parentCategory = categories.filter(
        (category) => !category.parentCategory,
    )
    if (parentCategory.length === 0) return null
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
                //add active property
                active: req.body.subCategoriesActive[i] === 'on' ? true : false,
            })
        }
    }

    return {
        parentCategory: req.body.name,
        parentId: req.body.id,
        parentColor: req.body.color,
        parentActive: req.body.active === 'on' ? true : false,
        subCats: subCategories,
    }
}
module.exports.updateCategoriesOrCreate = async (
    req,
    res,
    categoriesObject,
) => {
    // Update category name and color
    const parentCategory = await Category.findOneAndUpdate(
        { _id: categoriesObject.parentId, household: req.session.household },
        {
            name: categoriesObject.parentCategory,
            color: categoriesObject.parentColor,
            active: categoriesObject.parentActive,
        },
    ).populate('subCategories')
    if (!parentCategory) return null

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
            //if parent categore is passive then all the subcategoreise will be passive as well
            await Category.findOneAndUpdate(
                {
                    _id: subCategory.id,
                    parentCategory: parentCategory._id,
                },
                {
                    name: subCategory.name,
                    active: categoriesObject.parentActive
                        ? subCategory.active
                        : false,
                },
            )
        } else {
            const newSubCategory = new Category({
                name: subCategory.name,
                household: req.session.household,
                parentCategory: categoriesObject.parentId,
                active: categoriesObject.parentActive
                    ? subCategory.active
                    : false,
            })
            await newSubCategory.save()
        }
    })

    let deactivatedCount = 0
    if (subcategoryIdsToDelete.length > 0) {
        // Subcategories that still have expenses or debits are only made
        // passive, so their history stays in the reports
        const [usedByExpenses, usedByDebits] = await Promise.all([
            Expense.distinct('category', {
                category: { $in: subcategoryIdsToDelete },
            }),
            Debit.distinct('category', {
                category: { $in: subcategoryIdsToDelete },
            }),
        ])
        const usedIds = new Set(
            [...usedByExpenses, ...usedByDebits].map((id) => String(id)),
        )
        const idsToDeactivate = subcategoryIdsToDelete.filter((id) =>
            usedIds.has(id),
        )
        const idsToDelete = subcategoryIdsToDelete.filter(
            (id) => !usedIds.has(id),
        )

        await Category.updateMany(
            { _id: { $in: idsToDeactivate } },
            { active: false },
        )
        // Delete unused subcategories that should no longer exist
        await Category.deleteMany({ _id: { $in: idsToDelete } })
        deactivatedCount = idsToDeactivate.length
    }
    return { deactivatedCount }
}
module.exports.getPopularCategories = async (req) => {
    const householdId = req.session.household

    const topCategories = await Expense.aggregate([
        // Filter down to only expenses for the given household
        { $match: { household: { $eq: new Types.ObjectId(householdId) } } },

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
        { $replaceRoot: { newRoot: '$category' } },
    ])

    return topCategories
}
