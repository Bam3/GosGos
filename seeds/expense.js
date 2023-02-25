const Expense = require('../models/expense')
const Category = require('../models/category')
const allExpenses = require('./expensesAll')

module.exports.seedExpenses = async () => {
    //vsem stroškom popravi cost v number
    const subCategories = await Category.find({}).populate('subCategories')

    //zbrišem vse stroške v bazi
    await Expense.deleteMany({})

    const promises = []
    let payerID = ''
    //vzamem prvi vpisan strosek
    allExpenses.forEach(async (expense) => {
        //vzamem prvo kategorijo in preverim če se ujema parentCat s kat. prvega stroška
        subCategories.forEach(async (subCategory) => {
            if (subCategory.name === expense.category) {
                //ko najdem preverim če se ujema ime podkategorije s prvim stroškom
                //če se si zapišem id podkategorije, katera ima parentCategory
                subCategory.subCategories.forEach(async (subCatName) => {
                    if (subCatName.name === expense.subCategory) {
                        if (expense.payer === 'Miha') {
                            payerID = '63f542caa32f470814a243cc' //production user id: '62b0220d04b744701a0bab83'
                        } else if (expense.payer === 'Nataša') {
                            payerID = '63f542caa32f470814a243cd' //production user id: '62b021f604b744701a0bab7a'
                        } else {
                            payerID = '63f542caa32f470814a243ce' //production user id: '62ba152107ee0fb001590933'
                        }
                        const newExpense = new Expense({
                            cost:
                                typeof expense.cost == 'string'
                                    ? (expense.cost = Number(
                                          expense.cost.replace(',', '.')
                                      ))
                                    : expense.cost,
                            payer: payerID,
                            payDate: new Date(expense.payDate),
                            description: expense.description,
                            category: subCatName.id,
                            shared: Boolean(expense.shared),
                        })
                        console.log(newExpense)
                        promises.push(newExpense.save())
                    }
                })
            }
        })
    })
    await Promise.all(promises)
}
