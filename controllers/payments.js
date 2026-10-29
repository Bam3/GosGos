const crypto = require('crypto')
const { Types } = require('mongoose')
const User = require('../models/user')
const Household = require('../models/household')
const Expense = require('../models/expense')
const PendingPayment = require('../models/pendingPayment')
const { guessCategory } = require('./receipt')
const { findTotal, findStore } = require('../utils/receiptParser')

// The same payment can come twice (Apple Pay and SMS), within this time
// it is saved only once
const DUPLICATE_WINDOW = 15 * 60 * 1000
const MAX_TEXT_LENGTH = 1000

const hashApiKey = (key) =>
    crypto.createHash('sha256').update(key).digest('hex')

// New personal key for the logged in user, replaces the old one.
// Returns the key, it can not be read from the database later
module.exports.createApiKey = async (req) => {
    const key = `gg_${crypto.randomBytes(24).toString('base64url')}`
    await User.updateOne(
        { _id: req.session.usersID },
        { apiKeyHash: hashApiKey(key), apiKeyCreated: new Date() },
    )
    return key
}

module.exports.deleteApiKey = (req) =>
    User.updateOne(
        { _id: req.session.usersID },
        { $unset: { apiKeyHash: 1, apiKeyCreated: 1 } },
    )

// User from the "Authorization: Bearer <key>" header
module.exports.findUserByApiKey = async (req) => {
    const match = /^Bearer\s+(\S+)$/i.exec(req.get('Authorization') || '')
    if (!match) return null
    return User.findOne({ apiKeyHash: hashApiKey(match[1]) })
}

// Amount from the phone: a number, or text like "€12.34", "12,34 €" or
// "1.234,56 EUR". The last separator followed by 1-2 digits is decimal
const parseAmount = (value) => {
    if (typeof value === 'number') return value
    if (typeof value !== 'string') return null
    const number = value.replace(/[^\d.,]/g, '')
    const decimal = /[.,](\d{1,2})$/.exec(number)
    const whole = (decimal ? number.slice(0, decimal.index) : number).replace(
        /[.,]/g,
        '',
    )
    if (!whole && !decimal) return null
    return parseFloat(`${whole || 0}.${decimal ? decimal[1] : 0}`)
}
module.exports.parseAmount = parseAmount

const cleanText = (value, maxLength) =>
    typeof value === 'string' ? value.trim().slice(0, maxLength) || null : null

// Saves a payment sent from the phone as a pending payment.
// Body: { amount, merchant, card, date, source } from Apple Pay, or
// { text, source } with the text of a bank SMS or notification
module.exports.receivePayment = async (user, body) => {
    const text = cleanText(body.text, MAX_TEXT_LENGTH)
    const merchant =
        cleanText(body.merchant, 200) || (text ? findStore(text) : null)
    let cost = parseAmount(body.amount)
    if (!cost && text) cost = findTotal(text)
    cost = Math.round(Math.abs(cost || 0) * 100) / 100
    if (!cost) return { error: 'Znesek manjka.' }

    let payDate = body.date ? new Date(body.date) : new Date()
    if (isNaN(payDate)) payDate = new Date()
    const source = cleanText(body.source, 30)

    // Apple Pay and the bank SMS name the shop differently, so only the
    // amount is compared. The same amount twice from one source is most
    // likely two real payments
    const duplicate = await PendingPayment.findOne({
        user: user._id,
        cost,
        source: { $ne: source },
        inputDate: { $gte: new Date(Date.now() - DUPLICATE_WINDOW) },
    })
    if (duplicate) {
        return { duplicate: true, message: 'Plačilo je že shranjeno.' }
    }

    const category = await guessCategory(
        user.household,
        [merchant, text].filter(Boolean).join('\n'),
        merchant ? findStore(merchant) || merchant : null,
    )
    const payment = await PendingPayment.create({
        household: user.household,
        user: user._id,
        cost,
        merchant,
        payDate,
        source,
        card: cleanText(body.card, 100),
        text,
        category: category?._id,
    })
    return {
        id: payment._id,
        message: `GosGos: €${cost.toFixed(2)}${merchant ? ` ${merchant}` : ''}`,
    }
}

module.exports.countPendingPayments = (req) =>
    PendingPayment.countDocuments({ household: req.session.household })

module.exports.getPendingPayments = (req) =>
    PendingPayment.find({ household: req.session.household })
        .sort({ payDate: -1 })
        .populate('user')
        .populate({ path: 'category', populate: { path: 'parentCategory' } })

module.exports.getPendingPayment = (req, id) => {
    if (!Types.ObjectId.isValid(id)) return null
    return PendingPayment.findOne({ _id: id, household: req.session.household })
}

module.exports.deletePendingPayment = (req, id) => {
    if (!Types.ObjectId.isValid(id)) return null
    return PendingPayment.findOneAndDelete({
        _id: id,
        household: req.session.household,
    })
}

// Saves a pending payment as an expense with the guessed category
module.exports.confirmPendingPayment = async (req, id) => {
    const payment = await module.exports.getPendingPayment(req, id)
    if (!payment || !payment.category) return null
    const household = await Household.findById(req.session.household)
    const expense = await Expense.create({
        cost: payment.cost,
        payers: [payment.user],
        payDate: payment.payDate,
        description: payment.merchant || payment.text,
        category: payment.category,
        shared: household.defaultToSharedExpense,
        household: req.session.household,
    })
    await payment.deleteOne()
    return expense
}
