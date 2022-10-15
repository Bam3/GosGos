const Expense = require('../models/expense')
var _ = require('lodash')
const {
    extractFrom,
    calculateSum,
    roundToTwo,
} = require('../public/javascripts/pureFunctions')

module.exports.filterByCategoryAndDate = async (
    date,
    category,
    subCategory
) => {
    let expenses = {}
    let filterByCat = {}
    let filterByDate = {}
    let matchFilter = {}
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
    if (!date.filterByDate) {
        matchFilter = { $match: filterByCat }
    } else {
        //Sort by date and categories
        filterByDate = {
            payDate: {
                $gte: new Date(date.dateFrom),
                $lte: new Date(date.dateTo),
            },
        }
        matchFilter = {
            $match: {
                $and: [filterByDate, filterByCat],
            },
        }
    }
    if (!category && !subCategory) {
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
                    localField: 'payer',
                    foreignField: '_id',
                    as: 'payer',
                },
            },
            matchFilter,
            {
                $sort: { payDate: -1 },
            },
        ])
        //console.log(expenses[0])
        let sum = calculateSum(expenses)
        sum = roundToTwo(sum)
        return {
            expenses,
            sum,
            category,
            subCategory,
            date,
        }
    }
}
