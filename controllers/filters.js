const Category = require('../models/category')
const Expense = require('../models/expense')
const User = require('../models/user')
var _ = require('lodash')

module.exports.filterFunk = async () => {
    let expensesAggregate = {}
    expensesAggregate = await Expense.aggregate([
        {
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
    console.log(expensesAggregate)
}

module.exports.filterByCategoryAndDate = async (date, category) => {
    let expenses = {}
    console.log(date)
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
        {
            $match: {
                $and: [
                    {
                        payDate: {
                            $gte: new Date(date.dateFrom),
                            $lte: new Date(date.dateTo),
                        },
                    },
                    {
                        'parentCat.name': {
                            $eq: category,
                        },
                    },
                ],
            },
        },
    ])
    console.log(expenses[0])
    return { expenses }
}
