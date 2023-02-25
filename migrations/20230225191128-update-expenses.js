module.exports = {
    async up(db, client) {
        // TODO write your migration here.
        // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
        const expenses = await db.collection('expenses').find({}).toArray()
        const households = await db.collection('households').find({}).toArray()

        const operations = expenses.map((exspense) => {
            return db
                .collection('expenses')
                .updateOne(
                    { _id: exspense._id },
                    { $set: { household: households[0]._id } }
                )
        })
        return Promise.all(operations)
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
}
