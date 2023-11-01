module.exports = {
    async up(db, client) {
        const expenses = await db.collection('expenses').find({}).toArray()

        const operations = expenses.map(async (expense) => {
            let payers

            const payer = await db
                .collection('users')
                .findOne({ _id: expense.payer })

            if (!payer || payer.roll === 'shared') {
                const users = await db
                    .collection('users')
                    .find({
                        household: { $eq: expense.household },
                        roll: { $ne: 'shared' },
                    })
                    .toArray()
                payers = users.map((user) => user._id)
            } else {
                payers = [expense.payer]
            }

            return db
                .collection('expenses')
                .updateOne(
                    { _id: expense._id },
                    { $set: { payers: payers }, $unset: { payer: 1 } },
                )
        })

        //deleteOperation = db.collection('users').deleteMany({ roll: 'shared' })
        //operations.push(deleteOperation)

        return Promise.all(operations)
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
}
