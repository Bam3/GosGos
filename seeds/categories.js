const category = require('../models/category')
const Category = require('../models/category')

//[ 'dom', 'avti', 'hrana', 'darila', 'ljubljenčki', 'zdravje', 'dopust', 'hobi' ];
const categories = [
    {
        name: 'Dom',
        subCategories: [
            'Elektrika',
            'Plin',
            'Komunala',
            'Internet',
            'Upravnik',
            'RTV',
            'Vzdrževanje',
        ],
    },

    {
        name: 'BMW',
        subCategories: [
            'Gorivo',
            'Registracija',
            'Zavarovanje',
            'Vzdrževanje',
            'Pnevmatike',
        ],
    },

    {
        name: 'Clio',
        subCategories: [
            'Gorivo',
            'Registracija',
            'Zavarovanje',
            'Vzdrževanje',
            'Pnevmatike',
        ],
    },
    {
        name: 'Hrana',
        subCategories: [
            'Hofer',
            'DM',
            'Spar',
            'Tržnica',
            'Dostava',
            'Restavracije',
        ],
    },
    {
        name: 'Darila',
        subCategories: ['Družina', 'Prijatelji'],
    },
    {
        name: 'Ljubljenčki',
        subCategories: ['Hrana', 'Zdravila', 'Pregled', 'Moda', 'Igrače'],
    },
    {
        name: 'Hobi',
        subCategories: ['Kolesarstvo', 'Tek', 'Pohodi', 'Plezanje'],
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
