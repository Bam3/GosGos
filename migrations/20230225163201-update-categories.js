module.exports = {
    async up(db, client) {
        // TODO write your migration here.
        // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
        const categories = await db.collection('categories').find({}).toArray()
        const households = await db.collection('households').find({}).toArray()

        const operations = categories.map((category) => {
            return db
                .collection('categories')
                .updateOne(
                    { _id: category._id },
                    { $set: { household: households[0]._id } },
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
