const Category = require('../models/category')
const Expense = require('../models/expense')
const User = require('../models/user')
var _ = require('lodash')

module.exports.filterFunk = async () => {
    let expensesAggregate = {}
    expensesAggregate = await Expense.aggregate([{
            $match: {
                payDate: {
                    $gte: new Date(filter.from),
                    $lte: new Date(filter.to),
                },
            },
        },
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
        {
            $group: {
                _id: '$parentCat.name',
                sum: {
                    $sum: '$cost',
                },
            },
        },
    ])
}

module.exports.filterByCategoryAndDate = async (date, category, subCategory) => {
    let expenses = {}
    console.log(category, subCategory)
    let filterBy = {}
    if (!subCategory) {
        filterBy = {
            'parentCat.name': {
                $eq: category,
            },
        }
    } else {
        filterBy = {
            'category.name': {
                $eq: subCategory,
            },
        }
    }

    expenses = await Expense.aggregate([{
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
        {
            $match: {
                $and: [{
                        payDate: {
                            $gte: new Date(date.dateFrom),
                            $lte: new Date(date.dateTo),
                        },
                    },
                    filterBy,
                ],
            },
        },
        {
            $sort: {
                payDate: -1
            }
        },
        
    ])
    console.log(expenses)
    return {
        expenses
    }
}