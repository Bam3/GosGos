const path = require('path')
const sharp = require('sharp')
const { createWorker } = require('tesseract.js')
const { Types } = require('mongoose')
const Category = require('../models/category')
const Expense = require('../models/expense')
const {
    findTotal,
    findDate,
    findStore,
    containsWord,
} = require('../utils/receiptParser')

const MAX_PHOTO_SIZE = 15 * 1024 * 1024

// Phone photos: fix rotation from EXIF, shrink, and boost contrast so
// Tesseract can read faded thermal paper
const preparePhoto = (photo) =>
    sharp(photo)
        .rotate()
        .resize({
            width: 1600,
            height: 1600,
            fit: 'inside',
            withoutEnlargement: true,
        })
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer()

const readText = async (image) => {
    // slv.traineddata lives in the project root
    const worker = await createWorker('slv', 1, {
        langPath: path.join(__dirname, '..'),
        gzip: false,
        cacheMethod: 'none',
    })
    try {
        const { data } = await worker.recognize(image)
        return data.text
    } finally {
        await worker.terminate()
    }
}

// Words on bills that point to a category with a different name
const categoryHints = [
    [/ELEKTR(O|I[ČC]N)/i, 'Elektrika'],
    [/ZEMELJSKI\s+PLIN|PLINOVOD|ENERGETIKA/i, 'Plin'],
    [/BENCIN|DIZEL|DIESEL|GORIVO|NAFTA|POLNILNICA/i, 'Gorivo'],
    [/KOMUNAL|VODOVOD|SNAGA|ODPADK/i, 'Komunala'],
    [/TELEKOM|TELEMACH|T-2|INTERNET/i, 'Internet'],
    [/RTV\s*PRISPEVEK/i, 'RTV'],
]

const countExpensesByCategory = (req, match) =>
    Expense.aggregate([
        {
            $match: {
                household: new Types.ObjectId(req.session.household),
                ...match,
            },
        },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ])

// Several categories can share a name (Gorivo under BMW and Clio),
// pick the one the household uses most
const pickMostUsed = async (req, candidates) => {
    if (candidates.length <= 1) return candidates[0] || null
    const counts = await countExpensesByCategory(req, {
        category: { $in: candidates.map((category) => category._id) },
    })
    const mostUsedId = counts[0]?._id
    return (
        candidates.find((category) => category._id.equals(mostUsedId)) ||
        candidates[0]
    )
}

// Subcategories are more specific, use them when any match
const preferSubcategories = (matches) => {
    const subCategories = matches.filter((category) => category.parentCategory)
    return subCategories.length ? subCategories : matches
}

// Best category for the receipt, only from the user's household:
// 1. a subcategory named like the store (Hrana - Spar)
// 2. a category name that appears on the receipt (RTV)
// 3. a category hinted by words on the bill (BENCIN -> Gorivo)
// 4. the category most often used before for expenses mentioning the store
const guessCategory = async (req, text, store) => {
    const categories = await Category.find({
        household: req.session.household,
        active: true,
    })

    if (store) {
        const byStore = categories.filter(
            (category) =>
                containsWord(store, category.name) ||
                containsWord(category.name, store),
        )
        if (byStore.length)
            return pickMostUsed(req, preferSubcategories(byStore))
    }

    const byText = categories.filter(
        (category) =>
            category.name.length >= 3 && containsWord(text, category.name),
    )
    if (byText.length) return pickMostUsed(req, preferSubcategories(byText))

    const hintedNames = categoryHints
        .filter(([pattern]) => pattern.test(text))
        .map(([, name]) => name.toLowerCase())
    const byHint = categories.filter((category) =>
        hintedNames.includes(category.name.toLowerCase()),
    )
    if (byHint.length) return pickMostUsed(req, preferSubcategories(byHint))

    if (store) {
        const [mostUsed] = await countExpensesByCategory(req, {
            description: {
                $regex: store.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                $options: 'i',
            },
        })
        if (mostUsed) {
            return (
                categories.find((category) =>
                    category._id.equals(mostUsed._id),
                ) || null
            )
        }
    }
    return null
}

module.exports.scanReceipt = async (req) => {
    const photo = req.files?.receipt
    if (
        !photo ||
        Array.isArray(photo) ||
        !photo.mimetype.startsWith('image/')
    ) {
        return { error: 'Fotografija računa manjka.' }
    }
    if (photo.size > MAX_PHOTO_SIZE) {
        return { error: 'Fotografija je prevelika (največ 15 MB).' }
    }

    let text
    try {
        text = await readText(await preparePhoto(photo.data))
    } catch (e) {
        console.log('Receipt scan failed', e)
        return { error: 'Računa ni bilo mogoče prebrati.' }
    }

    const store = findStore(text)
    const category = await guessCategory(req, text, store)
    return {
        cost: findTotal(text),
        date: findDate(text),
        store,
        category: category && { id: category.id, name: category.name },
        text,
    }
}
