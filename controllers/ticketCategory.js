const { v4: uuid } = require('uuid')
const { TicketCategory, Ticket } = require('../models')
const customError = require('../hooks/customError')

const label = "ticket category"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    try {
        // GET ALL TicketCategory
        const data = await TicketCategory.findAll({
            include: [
                {
                    model: Ticket
                }
            ]
        })

        return res.json({ data: data })
    }
    catch (err) {
        next(err)
    }
}

// GET ONE
exports.getOne = async (req, res, next) => {
    try {
        // GET ID OF TicketCategory
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await TicketCategory.findOne({
            where: { id: id },
            include: [
                {
                    model: Ticket,
                }
            ],
        })
        if (!data) throw new customError('TicketCategoryNotFound', `${label} not found`)

        return res.json({ content: data })
    }
    catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        // GET DATA FOR ADD TicketCategory
        const { name } = req.body

        // GET NEW ID OF TicketCategory
        const id = uuid()

        // CHECK THIS DATA
        if (!name ) throw new customError('MissingData', 'missing data')

        // ADD TicketCategory
        data = await TicketCategory.create({
            id: id,
            name: name
        })

        if (!data) {
            throw new customError('AddTicketCategoryError', `${label} not created`)
        }

        return res.status(201).json({ message: `${label} created`, content: data })
    }
    catch (err) {
        next(err)
    }
}

// PATCH
exports.update = async (req, res, next) => {
    try {
        // GET ID OF TicketCategory
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET DATA FOR UPDATE TicketCategory
        const { name } = req.body

        // CHECK THIS TicketCategory
        let data = await TicketCategory.findOne({ where: { id: id } })
        if (!data) throw new customError('TicketCategoryNotFound', `${label} not exist`)

        const updatedFields = {
            name: name
        }

        // UPDATE
        data = await TicketCategory.update(updatedFields, { where: { id: id } })
        if (!data) {
            throw new customError('TicketCategoryUpdateError', `${label} not modified`)
        }

        return res.json({ message: `${label} modified` })
    }
    catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        // GET ID OF TicketCategory
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS TicketCategory
        let data = await TicketCategory.findOne({ where: { id: id } })
        if (!data) throw new customError('TicketCategoryNotFound', `${label} not exist`)

        data = await TicketCategory.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('TicketCategoryAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    }
    catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        // GET ID OF TicketCategory
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS TicketCategory
        let data = await TicketCategory.findOne({ where: { id: id } })
        if (!data) throw new customError('TicketCategoryNotFound', `${label} not exist`)

        data = await TicketCategory.destroy({ where: { id: id } })
        if (!data) throw new customError('TicketCategoryAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        // GET ID OF TicketCategory
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS TicketCategory
        let data = await TicketCategory.restore({ where: { id: id } })
        if (!data) throw new customError('TicketCategoryAlreadyRestored', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}