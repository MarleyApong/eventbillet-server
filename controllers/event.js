const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Event, TypeEvent, ManagerEvent, User } = require('../models')
const customError = require('../hooks/customError')

const label = "event"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k

    try {
        let whereClause = {}

        // OPTION FILTER
        if (keyboard) {
            if (filter !== 'createdAt' && filter !== 'updateAt' && filter !== 'deletedAt') {
                whereClause = {
                    ...whereClause,
                    [filter]: {
                        [Op.like]: `%${keyboard}%`,
                    },
                }
            }
            else {
                whereClause = {
                    ...whereClause,
                    [filter]: {
                        [Op.between]: [new Date(keyboard), new Date(keyboard + " 23:59:59")]
                    },
                }
            }
        }

        // GET ALL Event
        const data = await Event.findAll({
            where: whereClause,
            include: [
                {
                    model: TypeEvent,
                    attributes: ['id', 'name']
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })

        // GET TOTAL Event
        const totalElements = await Event.count()
        if (!data) throw new customError('EventNotFound', `${label} not found`)

        // DATE NOW
        const currentDate = new Date()

        // IN PROGRESS
        const inProgress = await Event.count({
            where: { 
                startDate: { [Op.lte]: currentDate }, 
                endDate: { [Op.gte]: currentDate }, 
            }
        })

        // FINISH
        const finish = await Event.count({
            where: { 
                endDate: { [Op.lte]: currentDate }
            }
        })

        return res.json({
            content: {
                data: data,
                totalPages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements,
                inProgress: inProgress,
                finish: finish,
                filter: filter,
                sort: sort,
                limit: limit,
                page: page,
            }
        })
    }
    catch (err) {
        next(err)
    }
}

// GET ONE
exports.getOne = async (req, res, next) => {
    try {
        // GET ID OF Event
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Event.findOne({
            where: { id: id },
            include: [
                {
                    model: TypeEvent,
                    attributes: ['id', 'name']
                }
            ],
        })
        if (!data) throw new customError('EventNotFound', `${label} not found`)

        return res.json({ content: data })
    }
    catch (err) {
        next(err)
    }
}

// GET Event BY USER
exports.getEventByUser = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k

    try {
        let whereClause = {}

        // OPTION FILTER
        if (keyboard) {
            if (filter !== 'createdAt' && filter !== 'updateAt' && filter !== 'deletedAt') {
                whereClause = {
                    ...whereClause,
                    [filter]: {
                        [Op.like]: `%${keyboard}%`
                    }
                }
            } else {
                whereClause = {
                    ...whereClause,
                    [filter]: {
                        [Op.between]: [new Date(keyboard), new Date(keyboard + " 23:59:59")]
                    }
                }
            }
        }

        // GET ID OF USER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET TOTAL OF Event
        const totalCount = await Event.count({
            include: [
                {
                    model: ManagerEvent,
                    include: [
                        {
                            model: User,
                            attributes: ['id']
                        }
                    ]
                }
            ],
            where: whereClause
        })

        // GET Event BY USER
        const userEvent = await Event.findAll({
            include: [
                {
                    model: ManagerEvent,
                    include: [
                        {
                            model: User,
                            attributes: { exclude: ['password'] },
                        }
                    ]
                }
            ],
            where: whereClause,
            offset: (page - 1) * limit,
            limit: limit,
            order: [[filter, sort]],
        })

        return res.json({
            totalEvent: totalCount,
            content: {
                data: userEvent,
                totalPages: Math.ceil(totalCount / limit),
                currentElements: userEvent.length,
                totalElements: totalCount,
                filter: filter,
                sort: sort,
                limit: limit,
                page: page
            }
        })
    }
    catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        // GET DATA FOR ADD Event
        const { idTypeEvent, idUser, name, nbPlace, startDate, endDate } = req.body

        // GET NEW ID OF Event
        const id = uuid()

        // CHECK THIS DATA
        if (!idTypeEvent || !idUser || !name  || !description || !nbPlace || !startDate || !endDate) throw new customError('MissingData', 'missing data')

        // ADD Event
        data = await Event.create({
            id: id,
            idTypeEvent:idTypeEvent,
            name: name,
            description: description,
            nbPlace: nbPlace,
            startDate: startDate,
            endDate: endDate
        })

        await ManagerEvent.create({
            id: uuid(),
            idEvent: id,
            idUser: idUser
        })

        if (!data) {
            throw new customError('AddEventError', `${label} not created`)
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
        // GET ID OF Event
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET DATA FOR UPDATE Event
        const { idTypeEvent, name, nbPlace, startDate, endDate } = req.body

        // CHECK THIS Event
        let data = await Event.findOne({ where: { id: id } })
        if (!data) throw new customError('EventNotFound', `${label} not exist`)

        // NEW DATA WITOUT PICTURE
        const updatedFields = {
            idTypeEvent:idTypeEvent,
            name: name,
            description: description,
            nbPlace: nbPlace,
            startDate: startDate,
            endDate: endDate
        }

        // UPDATE
        data = await Event.update(updatedFields, { where: { id: id } })
        if (!data) {
            throw new customError('EventUpdateError', `${label} not modified`)
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
        // GET ID OF Event
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS Event
        let data = await Event.findOne({ where: { id: id } })
        if (!data) throw new customError('EventNotFound', `${label} not exist`)

        data = await Event.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('EventAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    }
    catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        // GET ID OF Event
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS Event
        let data = await Event.findOne({ where: { id: id } })
        if (!data) throw new customError('EventNotFound', `${label} not exist`)

        data = await Event.destroy({ where: { id: id } })
        if (!data) throw new customError('EventAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        // GET ID OF Event
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS Event
        let data = await Event.restore({ where: { id: id } })
        if (!data) throw new customError('EventAlreadyRestored', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}