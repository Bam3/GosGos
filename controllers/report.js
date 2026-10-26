const { Types } = require('mongoose')
const Category = require('../models/category')
const Expense = require('../models/expense')
const User = require('../models/user')
const { roundToTwo } = require('../public/javascripts/pureFunctions')

const monthLabels = [
    'jan',
    'feb',
    'mar',
    'apr',
    'maj',
    'jun',
    'jul',
    'avg',
    'sep',
    'okt',
    'nov',
    'dec',
]
module.exports.monthLabels = monthLabels

const emptyMonths = () => new Array(12).fill(0)

// Same share logic as the expenses page: 'true' = shared household expenses,
// 'false' = personal expenses of the logged in user.
const buildMatch = async (req, share) => {
    const match = {
        household: new Types.ObjectId(req.session.household),
        shared: share === 'true',
    }
    if (share === 'false') {
        const currentUser = await User.findOne({
            username: req.session.passport.user,
            household: req.session.household,
        })
        match.payers = currentUser._id
    }
    return match
}

module.exports.parseShare = (share) => (share === 'false' ? 'false' : 'true')

module.exports.getAvailableYears = async (req) => {
    const years = await Expense.aggregate([
        {
            $match: {
                household: new Types.ObjectId(req.session.household),
            },
        },
        { $group: { _id: { $year: '$payDate' } } },
        { $sort: { _id: -1 } },
    ])
    const availableYears = years.map((year) => year._id)
    const currentYear = new Date().getFullYear()
    if (!availableYears.includes(currentYear)) {
        availableYears.unshift(currentYear)
    }
    return availableYears
}

module.exports.getYearlyReport = async (req, { year, share }) => {
    const match = await buildMatch(req, share)
    match.payDate = {
        $gte: new Date(Date.UTC(year, 0, 1)),
        $lt: new Date(Date.UTC(year + 1, 0, 1)),
    }

    // Sum costs per (sub)category and month
    const sums = await Expense.aggregate([
        { $match: match },
        {
            $group: {
                _id: { category: '$category', month: { $month: '$payDate' } },
                sum: { $sum: '$cost' },
            },
        },
    ])

    const categories = await Category.find({
        household: req.session.household,
    })
    const categoriesById = new Map(
        categories.map((category) => [category.id, category]),
    )

    // Build parent category rows, each with its own subcategory rows
    const rows = new Map()
    const getRow = (map, category) => {
        if (!map.has(category.id)) {
            map.set(category.id, {
                id: category.id,
                name: category.name,
                color: category.color,
                months: emptyMonths(),
                total: 0,
                subCategories: new Map(),
            })
        }
        return map.get(category.id)
    }

    sums.forEach(({ _id, sum }) => {
        const category = categoriesById.get(String(_id.category))
        if (!category) return
        const parent = category.parentCategory
            ? categoriesById.get(String(category.parentCategory))
            : category
        const monthIndex = _id.month - 1

        const parentRow = getRow(rows, parent)
        parentRow.months[monthIndex] += sum
        parentRow.total += sum

        if (category.parentCategory) {
            const subRow = getRow(parentRow.subCategories, category)
            subRow.months[monthIndex] += sum
            subRow.total += sum
        }
    })

    const byTotal = (a, b) => b.total - a.total
    const finishRow = (row) => ({
        ...row,
        months: row.months.map(roundToTwo),
        total: roundToTwo(row.total),
        subCategories: [...row.subCategories.values()]
            .map(finishRow)
            .sort(byTotal),
    })
    const categoryRows = [...rows.values()].map(finishRow).sort(byTotal)

    const monthTotals = emptyMonths()
    categoryRows.forEach((row) =>
        row.months.forEach((sum, i) => (monthTotals[i] += sum)),
    )
    const total = roundToTwo(monthTotals.reduce((sum, m) => sum + m, 0))

    return {
        year,
        share,
        monthLabels,
        categoryRows,
        monthTotals: monthTotals.map(roundToTwo),
        total,
    }
}

module.exports.getCategoryComparison = async (
    req,
    { categoryId, years, share },
) => {
    if (!Types.ObjectId.isValid(categoryId)) return null
    const category = await Category.findOne({
        _id: categoryId,
        household: req.session.household,
    }).populate('subCategories')
    if (!category) return null

    // A parent category includes all of its subcategories
    const categoryIds = [
        category._id,
        ...(category.subCategories || []).map((sub) => sub._id),
    ]

    const match = await buildMatch(req, share)
    match.category = { $in: categoryIds }
    match.$expr = { $in: [{ $year: '$payDate' }, years] }

    const sums = await Expense.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    year: { $year: '$payDate' },
                    month: { $month: '$payDate' },
                },
                sum: { $sum: '$cost' },
            },
        },
    ])

    const today = new Date()
    const series = [...years]
        .sort((a, b) => a - b)
        .map((year) => {
            const months = emptyMonths()
            sums.filter(({ _id }) => _id.year === year).forEach(
                ({ _id, sum }) => (months[_id.month - 1] += sum),
            )
            const total = months.reduce((sum, m) => sum + m, 0)
            // Average only over months that already passed, so the current
            // year can be compared fairly with full past years
            const monthsElapsed =
                year === today.getFullYear()
                    ? today.getMonth() + 1
                    : year > today.getFullYear()
                      ? 0
                      : 12
            return {
                year,
                months: months.map(roundToTwo),
                total: roundToTwo(total),
                monthlyAverage: monthsElapsed
                    ? roundToTwo(total / monthsElapsed)
                    : 0,
            }
        })

    // Change of the monthly average compared to the previous selected year
    series.forEach((entry, i) => {
        const previous = series[i - 1]
        entry.change =
            previous && previous.monthlyAverage
                ? roundToTwo(
                      ((entry.monthlyAverage - previous.monthlyAverage) /
                          previous.monthlyAverage) *
                          100,
                  )
                : null
    })

    let label = category.name
    if (category.parentCategory) {
        await category.populate('parentCategory')
        label = `${category.parentCategory.name} - ${category.name}`
    }

    return {
        category: { id: category.id, label, color: category.color },
        series,
    }
}
