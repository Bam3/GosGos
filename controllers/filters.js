const Expense = require('../models/expense')
const Category = require('../models/category')
const { sumBy } = require('lodash')
const mongoose = require('mongoose')
const {
    roundToTwo,
    getLastMonthStartEndDate,
} = require('../public/javascripts/pureFunctions')

module.exports.filterByCategoryAndDate = async (
    req,
    res,
    filteredByDate,
    dateFrom,
    dateTo,
    category,
    subCategory,
    keyword,
) => {
    let expenses = {}
    let filterByCat = {}
    let filterByDate = {}
    let matchFilter = {}
    let filterHousehold = {
        household: { $eq: new mongoose.Types.ObjectId(req.session.household) },
    }
    let filterSharedExpenses = { shared: true }
    keyword = typeof keyword === 'string' ? keyword.trim() : ''
    //Search by keyword in category and sub category names
    let filterByKeyword = {}
    if (keyword) {
        const categoryIds = await getCategoryIdsByKeyword(req, keyword)
        filterByKeyword = { 'category._id': { $in: categoryIds } }
    }
    //Sort by cat
    if (!subCategory && category) {
        filterByCat = { 'parentCat.name': { $eq: category } }
    }
    //Sort by sub category
    if (subCategory && !category) {
        filterByCat = { 'category.name': { $eq: subCategory[0] } }
    }
    //Sort by category and sub category
    if (subCategory && category) {
        if (subCategory.length === 1) {
            filterByCat = {
                $and: [
                    { 'parentCat.name': { $eq: category } },
                    { 'category.name': { $eq: subCategory[0] } },
                ],
            }
        } else {
            const multiSubCats = []
            //Get multiple sub categories
            subCategory.forEach((category) => {
                multiSubCats.push({ 'category.name': { $eq: `${category}` } })
            })
            filterByCat = {
                $and: [
                    { 'parentCat.name': { $eq: category } },
                    { $or: multiSubCats },
                ],
            }
        }
    }
    //Sort only by categories
    if (filteredByDate === undefined) {
        matchFilter = {
            $match: {
                $and: [
                    filterByCat,
                    filterByKeyword,
                    filterHousehold,
                    filterSharedExpenses,
                ],
            },
        }
    } else {
        //Sort by date and categories
        filterByDate = {
            payDate: {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo),
            },
        }
        matchFilter = {
            $match: {
                $and: [
                    filterByDate,
                    filterByCat,
                    filterByKeyword,
                    filterHousehold,
                    filterSharedExpenses,
                ],
            },
        }
    }
    if (!category && !subCategory && !keyword) {
        return { expenses }
    } else {
        expenses = await Expense.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category.parentCategory',
                    foreignField: '_id',
                    as: 'parentCat',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'payers',
                    foreignField: '_id',
                    as: 'payers',
                },
            },
            // $lookup skips the schema's `select: false`, so drop password
            // fields before expenses are sent to the page
            { $project: { 'payers.hash': 0, 'payers.salt': 0 } },
            matchFilter,
            {
                $sort: { payDate: -1 },
            },
        ])

        const sum = roundToTwo(sumBy(expenses, 'cost'))

        return {
            expenses,
            sum,
            category,
            subCategory,
            keyword,
            date: {
                filteredByDate,
                dateFrom,
                dateTo,
            },
        }
    }
}

// Ids of household categories whose name contains the keyword. A matching
// parent category also brings in all of its subcategories.
const getCategoryIdsByKeyword = async (req, keyword) => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matchingCategories = await Category.find({
        household: req.session.household,
        name: { $regex: escapedKeyword, $options: 'i' },
    })
    const matchingIds = matchingCategories.map((category) => category._id)
    const subCategories = await Category.find({
        household: req.session.household,
        parentCategory: { $in: matchingIds },
    })
    return [...matchingIds, ...subCategories.map((category) => category._id)]
}
