const { Role } = require('../models')
const customError = require('../hooks/customError')

const label = "role"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    try {
        const data = await Role.findAll()
        if (!data) throw new customError('RoleNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}