const { v4: uuid } = require('uuid')
const { Ticket, TicketCategory } = require('../models')
const customError = require('../hooks/customError')

const label = "ticket"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    try {
        // GET ALL Ticket
        const data = await Ticket.findAll({
            include: [
                {
                    model: TicketCategory
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
        // GET ID OF Ticket
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Ticket.findOne({
            where: { id: id },
            include: [
                {
                    model: TicketCategory,
                }
            ],
        })
        if (!data) throw new customError('TicketNotFound', `${label} not found`)

        return res.json({ content: data })
    }
    catch (err) {
        next(err)
    }
}

// CREATE
// exports.add = async (req, res, next) => {
//     try {
//         // GET DATA FOR ADD Ticket
//         const { idTicketCategory, name, price } = req.body

//         // GET NEW ID OF Ticket
//         const id = uuid()
//         // numberId

//         // CHECK THIS DATA
//         if (!name ) throw new customError('MissingData', 'missing data')

//         // ADD Ticket
//         data = await Ticket.create({
//             id: id,
//             idTicketCategory: idTicketCategory,
//             name: name,
//             price: price
//         })

//         if (!data) {
//             throw new customError('AddTicketError', `${label} not created`)
//         }

//         return res.status(201).json({ message: `${label} created`, content: data })
//     }
//     catch (err) {
//         next(err)
//     }
// }

// PATCH
exports.update = async (req, res, next) => {
    try {
        // GET ID OF Ticket
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET DATA FOR UPDATE Ticket
        const { name } = req.body

        // CHECK THIS Ticket
        let data = await Ticket.findOne({ where: { id: id } })
        if (!data) throw new customError('TicketNotFound', `${label} not exist`)

        const updatedFields = {
            name: name
        }

        // UPDATE
        data = await Ticket.update(updatedFields, { where: { id: id } })
        if (!data) {
            throw new customError('TicketUpdateError', `${label} not modified`)
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
        // GET ID OF Ticket
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS Ticket
        let data = await Ticket.findOne({ where: { id: id } })
        if (!data) throw new customError('TicketNotFound', `${label} not exist`)

        data = await Ticket.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('TicketAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    }
    catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        // GET ID OF Ticket
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS Ticket
        let data = await Ticket.findOne({ where: { id: id } })
        if (!data) throw new customError('TicketNotFound', `${label} not exist`)

        data = await Ticket.destroy({ where: { id: id } })
        if (!data) throw new customError('TicketAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        // GET ID OF Ticket
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS Ticket
        let data = await Ticket.restore({ where: { id: id } })
        if (!data) throw new customError('TicketAlreadyRestored', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}