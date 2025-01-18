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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
    },
    {
        name: 'Darila',
        subCategories: ['Družina', 'Prijatelji'],
        color: '#8AB17D',
        active: true,
    },
    {
        name: 'Ljubljenčki',
        subCategories: ['Hrana', 'Zdravila', 'Pregled', 'Moda', 'Igrače'],
        color: '#F4A261',
        active: true,
    },
    {
        name: 'Hobi',
        subCategories: ['Kolesarstvo', 'Tek', 'Pohodi', 'Plezanje'],
        color: '#E9C46A',
        active: true,
    },
    {
        name: 'Zabava',
        subCategories: ['Dopust', 'Igrice', 'Knjige'],
        color: '#EFB366',
        active: true,
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
                active: category.active,
            })
            await categoryObject.save()

            await Promise.all(
                category.subCategories.map(async (subCategory) => {
                    const subCategoryObject = new Category({
                        name: subCategory,
                        parentCategory: categoryObject._id,
                        household: household._id,
                        active: true,
                    })
                    await subCategoryObject.save()
                }),
            )
        }),
    )
}
