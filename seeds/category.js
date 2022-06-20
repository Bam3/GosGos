const Category = require('../models/category')

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
            'Vzdrževanje in nakupi',
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
    await Category.deleteMany({})

    await Promise.all(
        categories.map(async (category) => {
            const categoryObject = new Category({ name: category.name })
            await categoryObject.save()

            await Promise.all(
                category.subCategories.map(async (subCategory) => {
                    const subCategoryObject = new Category({
                        name: subCategory,
                        parentCategory: categoryObject._id,
                    })
                    await subCategoryObject.save()
                })
            )
        })
    )
}
