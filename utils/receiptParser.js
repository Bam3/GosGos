// Reads total, date and store from the text Tesseract recognised on a receipt

// Lines that name the total, strongest first
const totalKeywords = [
    /ZA\s*PLA[ČC]ILO/i,
    /SKUPAJ/i,
    /SKUPNI\s*ZNESEK/i,
    /ZNESEK/i,
    /TOTAL/i,
    /PLA[ČC]ANO/i,
]
// Lines with amounts that are not the total
const notTotalKeywords =
    /DDV|OSNOVA|VRA[ČC]ILO|GOTOVINA|POPUST|PRIHRAN|TO[ČC]K|BON|DROBIŽ/i

// Well known Slovenian shops, used when no category name matches
const knownStores = [
    'Interspar',
    'Spar',
    'Mercator',
    'Hofer',
    'Lidl',
    'Tuš',
    'Eurospin',
    'Leclerc',
    'Jager',
    'Müller',
    'Rossmann',
    'Petrol',
    'OMV',
    'MOL',
    'Shell',
    'Bauhaus',
    'Merkur',
    'OBI',
    'Ikea',
    'Big Bang',
    'Harvey Norman',
    'Decathlon',
    'Intersport',
    'Hervis',
    'Pepco',
    'Action',
    'Tedi',
    'KiK',
    'Lekarna',
    'Pošta',
    'DM',
]

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Matches a whole word, so "DM" does not match inside "ADMIN"
module.exports.containsWord = (text, word) =>
    new RegExp(`(^|[^\\p{L}])${escapeRegex(word)}($|[^\\p{L}])`, 'iu').test(
        text,
    )

// "12,34", "12.34" and OCR variants like "12, 34"
const findAmounts = (line) =>
    [...line.matchAll(/(\d{1,5})\s?[.,]\s?(\d{2})(?![\d%])/g)].map((match) =>
        parseFloat(`${match[1]}.${match[2]}`),
    )

module.exports.findTotal = (text) => {
    const lines = text.split('\n').map((line) => line.trim())

    for (const keyword of totalKeywords) {
        for (let i = 0; i < lines.length; i++) {
            if (!keyword.test(lines[i]) || notTotalKeywords.test(lines[i]))
                continue
            // The amount is usually on the same line, but OCR sometimes
            // puts it on the next one
            const amounts = findAmounts(lines[i])
            if (amounts.length) return amounts[amounts.length - 1]
            const nextAmounts = findAmounts(lines[i + 1] || '')
            if (nextAmounts.length) return nextAmounts[nextAmounts.length - 1]
        }
    }

    // No keyword found: the largest amount is most likely the total
    const amounts = lines
        .filter((line) => !notTotalKeywords.test(line))
        .flatMap(findAmounts)
    return amounts.length ? Math.max(...amounts) : null
}

// First real date on the receipt that is not in the future, as YYYY-MM-DD
module.exports.findDate = (text, today = new Date()) => {
    const candidates = [
        ...[...text.matchAll(/(\d{4})-(\d{1,2})-(\d{1,2})/g)].map((m) => ({
            year: +m[1],
            month: +m[2],
            day: +m[3],
        })),
        ...[
            ...text.matchAll(
                /(\d{1,2})\s?[./-]\s?(\d{1,2})\s?[./-]\s?(\d{4}|\d{2})(?!\d)/g,
            ),
        ].map((m) => ({
            year: m[3].length === 2 ? 2000 + +m[3] : +m[3],
            month: +m[2],
            day: +m[1],
        })),
    ]
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    for (const { year, month, day } of candidates) {
        const date = new Date(Date.UTC(year, month - 1, day))
        const isRealDate =
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day
        if (isRealDate && year >= today.getFullYear() - 3 && date <= tomorrow) {
            return date.toISOString().substring(0, 10)
        }
    }
    return null
}

// Store name: a known shop, else the first line with a company form
// like "d.o.o."
module.exports.findStore = (text) => {
    for (const name of knownStores) {
        if (module.exports.containsWord(text, name)) return name
    }
    const companyLine = text
        .split('\n')
        .find((line) => /d\.\s?o\.\s?o|d\.\s?d\.|s\.\s?p\./i.test(line))
    if (companyLine) {
        return companyLine
            .replace(/,?\s*(d\.\s?o\.\s?o|d\.\s?d|s\.\s?p)[.,]?.*$/i, '')
            .trim()
    }
    return null
}
