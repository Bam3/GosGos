const category = require('../models/category')
const Category = require('../models/category')

//[ 'dom', 'avti', 'hrana', 'darila', 'ljubljenčki', 'zdravje', 'dopust', 'hobi' ];
const categories = [
    {
        name: 'dom',
        subCategories: [
            'elektrika',
            'plin',
            'komunala',
            'internet',
            'upravnik',
            'rtv',
            'vzdrževanje',
        ],
    },

    {
        name: 'bmw',
        subCategories: [
            'gorivo',
            'registracija',
            'zavarovanje',
            'vzdrževanje',
            'pnevmatike',
        ],
    },

    {
        name: 'clio',
        subCategories: [
            'gorivo',
            'registracija',
            'zavarovanje',
            'vzdrževanje',
            'pnevmatike',
        ],
    },
    {
        name: 'hrana',
        subCategories: [
            'hofer',
            'dm',
            'spar',
            'tržnica',
            'dostava',
            'restavracije',
        ],
    },
    {
        name: 'darila',
        subCategories: ['družina', 'prijatelji'],
    },
    {
        name: 'ljubljenčki',
        subCategories: ['hrana', 'zdravila', 'pregled', 'moda', 'igrače'],
    },
    {
        name: 'hobi',
        subCategories: ['kolesarstvo', 'tek', 'pohodi', 'plezanje'],
    },
]

module.exports.seedCategories = async () => {
    //zbrišem celo bazo Category
    await Category.deleteMany({})

    categories.forEach(async (category) => {
        const categoryObject = new Category({ name: category.name })
        await categoryObject.save()

        // Gremo čez stringe subcategoryjev
        category.subCategories.forEach(async (subCategory) => {
            // Vsakega damo v bazo
            const subCategoryObject = new Category({
                name: subCategory,
                parentCategory: categoryObject._id,
            })
            await subCategoryObject.save()
        })
    })
}
