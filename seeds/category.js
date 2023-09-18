const Category = require('../models/category')
const Household = require('../models/household')

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
        color: '#264653',
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
        color: '#2A9D8F',
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
        color: '#BABB74',
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
            'Mercator',
            'E.Leclerc',
            'Lekarna',
            'Tuš',
        ],
        color: '#287271',
    },
    {
        name: 'Darila',
        subCategories: ['Družina', 'Prijatelji'],
        color: '#8AB17D',
    },
    {
        name: 'Ljubljenčki',
        subCategories: ['Hrana', 'Zdravila', 'Pregled', 'Moda', 'Igrače'],
        color: '#F4A261',
    },
    {
        name: 'Hobi',
        subCategories: ['Kolesarstvo', 'Tek', 'Pohodi', 'Plezanje'],
        color: '#E9C46A',
    },
    {
        name: 'Zabava',
        subCategories: ['Dopust', 'Igrice', 'Knjige'],
        color: '#EFB366',
    },
]

module.exports.seedCategories = async () => {
    await Category.deleteMany({})

    const household = await Household.findOne({})

    await Promise.all(
        categories.map(async (category) => {
            const categoryObject = new Category({
                name: category.name,
                color: category.color,
                household: household._id,
            })
            await categoryObject.save()

            await Promise.all(
                category.subCategories.map(async (subCategory) => {
                    const subCategoryObject = new Category({
                        name: subCategory,
                        parentCategory: categoryObject._id,
                        household: household._id,
                    })
                    await subCategoryObject.save()
                }),
            )
        }),
    )
}
