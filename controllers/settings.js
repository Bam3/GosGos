const User = require('../models/user')
const Household = require('../models/household')

module.exports.updateSettings = async (req) => {
    const formData = req.body

    // Fetch current user and household from DB
    const currentUser = await User.findOne({ _id: req.session.usersID })
    const currentHousehold = await Household.findOne({
        _id: req.session.household,
    })

    // Set new settings based on values from form
    currentUser.color = formData.color
    currentHousehold.defaultToSharedExpense =
        formData.defaultToSharedExpense === 'true'

    // Save both objects
    await currentUser.save()
    await currentHousehold.save()
}
