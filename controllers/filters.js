const Expense = require('../models/expense')
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
) => {
    let expenses = {}
    let filterByCat = {}
    let filterByDate = {}
    let matchFilter = {}
    let filterHousehold = {
        household: { $eq: new mongoose.Types.ObjectId(req.session.household) },
    }
    let filterSharedExpenses = { shared: true }
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
                $and: [filterByCat, filterHousehold, filterSharedExpenses],
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
                    filterHousehold,
                    filterSharedExpenses,
                ],
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
                    localField: 'payers',
                    foreignField: '_id',
                    as: 'payers',
                },
            },
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
            date: {
                filteredByDate,
                dateFrom,
                dateTo,
            },
        }
    }
}
