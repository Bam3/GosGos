const Expense = require('../models/expense')
const Category = require('../models/category')
const allExpenses = require('./expensesAll')

module.exports.seedExpenses = async () => {
    //vsem stroškom popravi cost v number
    const subCategories = await Category.find({}).populate('subCategories')

    await Expense.deleteMany({})

    //vzamem prvi vpisan strosek
    await Promise.all(
        allExpenses.forEach(async (expense) => {
            //vzamem prvo kategorijo in preverim če se ujema parentCat s kat. prvega stroška
            await Promise.all(
                subCategories.forEach(async (subCategory) => {
                    if (subCategory.name === expense.category) {
                        //ko najdem preverim če se ujema ime podkategorije s prvim stroškom
                        //če se si zapišem id podkategorije, katera ima parentCategory
                        await Promise.all(
                            subCategory.subCategories.forEach(
                                async (subCatName) => {
                                    if (
                                        subCatName.name === expense.subCategory
                                    ) {
                                        const newExpense = new Expense({
                                            cost:
                                                typeof expense.cost == 'string'
                                                    ? (expense.cost = Number(
                                                          expense.cost.replace(
                                                              ',',
                                                              '.'
                                                          )
                                                      ))
                                                    : expense.cost,
                                            payer:
                                                expense.payer === 'Miha'
                                                    ? '62aca9d08b4df26a60e2570a'
                                                    : '62acabbc8b4df26a60e25711',
                                            payDate: new Date(expense.payDate),
                                            description: expense.description,
                                            category: subCatName.id,
                                            shared: Boolean(expense.shared),
                                        })
                                        console.log(newExpense)
                                        await newExpense.save()
                                    }
                                }
                            )
                        )
                    }
                })
            )
        })
    )
}

//subCategories[n].name === allExpenses[n].category &&
//subCategories[0].subCategories.name === allExpenses[n].subCategory
//potem
//    iskanID = subCategories[0].subCategories.id
