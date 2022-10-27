class UserOrCategoryObject {
    constructor(name, payments, inCalculation = true, color, numberOfPayments) {
        this.name = name
        this.payments = payments
        this.inCalculation = inCalculation
        this.color = color
        this.numberOfPayments = numberOfPayments
    }
    get sumOfExpenses() {
        return roundToTwo(this.sumPayments())
    }
    get numberOfExpenses() {
        return this.numOfExpenses()
    }
    sumPayments() {
        const payments = this.payments
        return payments.reduce((a, b) => a + b, 0)
    }
    numOfExpenses() {
        return this.payments.length
    }
}
function roundToTwo(num) {
    return Number(Math.round(num + 'e2') + 'e-2')
}
module.exports = UserOrCategoryObject
