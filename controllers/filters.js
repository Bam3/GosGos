const Category = require('../models/category')
const Expense = require('../models/expense')
const User = require('../models/user')
var _ = require('lodash')

module.exports.filterByCategoryAndDate = async (
    date,
    category,
    subCategory
) => {
    let datasets = []
    const subCatColors = [
        'red',
        'blue',
        'yellow',
        'green',
        'white',
        'pink',
        'purple',
    ]
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
                    filterBy,
                ],
            },
        },
        {
            $sort: {
                payDate: -1,
            },
        },
    ])
    for (let i = 0; i < expenses.length; i++) {
        datasets[i] = {
            label: expenses[i].category[0].name,
            data: expenses[i].cost,
            backgroundColor: subCatColors[i],
            stack: 'Stack 0',
        }
    }
    console.log(datasets)
    return {
        expenses,
    }
}
