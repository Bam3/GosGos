const Expense = require('../models/expense')
var _ = require('lodash')

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
    if (!subCategory) {
        filterByCat = { 'parentCat.name': { $eq: category } }
    } else {
        filterByCat = { 'category.name': { $eq: subCategory } }
    }
    //Sort by date
    if (!date.filterByDate) {
        matchFilter = { $match: filterByCat }
    } else {
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
        return {
            expenses,
        }
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
                $sort: {
                    payDate: -1,
                },
            },
        ])
        return {
            expenses,
        }
    }
}
