module.exports = {
    async up(db, client) {
        return db
            .collection('households')
            .updateMany({}, { $set: { defaultToSharedExpense: true } })
    },

    async down(db, client) {
        return db
            .collection('households')
            .updateMany({}, { $unset: { defaultToSharedExpense: 1 } })
    },
}
