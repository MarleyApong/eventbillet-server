const fs = require('fs')
const path = require('path')
const multer = require('multer')
const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Event, TypeEvent, ManagerEvent, User } = require('../models')
const customError = require('../hooks/customError')

const label = "type event"

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
        const data = await TypeEvent.findAll({
            where: whereClause,
            include: [
                {
                    model: Event
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })

        // GET TOTAL Event
        const totalElements = await TypeEvent.count()
        if (!data) throw new customError('TypeEventNotFound', `${label} not found`)

        return res.json({
            content: {
                data: data,
                totalPages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements,
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

        const data = await TypeEvent.findOne({
            where: { id: id },
            include: [
                {
                    model: Event
                }
            ],
        })
        if (!data) throw new customError('TypeEventNotFound', `${label} not found`)

        return res.json({ content: data })
    }
    catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        // GET DATA FOR ADD Event
        const { name } = req.body

        // GET NEW ID OF Event
        const id = uuid()

        // CHECK THIS DATA
        if (!name) throw new customError('MissingData', 'missing data')
        let picturePath = '' // INITIALIZATION OF IMAGE PATH

        if (req.file) {
            picturePath = req.file.path // PATH
        }

        // HERE, WE DELETE THE WORD 'PUBLIC' IN THE PATH
        const pathWithoutPublic = picturePath.substring(6)

        // ADD Event
        data = await TypeEvent.create({
            id: id,
            name: name,
            picture: pathWithoutPublic
        })

        if (!data) {
            throw new customError('AddTypeEventError', `${label} not created`)
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
        // GET ID OF TypeEvent
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET DATA FOR UPDATE TypeEvent
        const { name } = req.body

        // CHECK THIS TypeEvent
        let data = await TypeEvent.findOne({ where: { id: id } })
        if (!data) throw new customError('TypeEventNotFound', `${label} not exist`)

        // NEW DATA WITOUT PICTURE
        const updatedFields = {
            name: name
        }

        // CHANGE PICTURE
        if (req.file) {
            if (data.picture) {
                const filePath = data.picture
                fs.unlinkSync(filePath) // DELETING LAST IMAGE
            }

            const extension = req.file.originalname.split('.').pop() // RETRIEVING THE FILE EXTENSION
            const newPicturePath = `/imgs/event/${Date.now()}_${uuid()}.${extension}` // NEW PATH

            fs.renameSync(req.file.path, `.${newPicturePath}`)
            updatedFields.picture = newPicturePath // STORING THEN NEW IMAGE PATH
        }

        // UPDATE
        data = await TypeEvent.update(updatedFields, { where: { id: id } })
        if (!data) {
            throw new customError('TypeEventUpdateError', `${label} not modified`)
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
        // GET ID OF TypeEvent
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS TypeEvent
        let data = await TypeEvent.findOne({ where: { id: id } })
        if (!data) throw new customError('TypeEventNotFound', `${label} not exist`)

        data = await TypeEvent.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('TypeEventAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    }
    catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        // GET ID OF TypeEvent
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS TypeEvent
        let data = await TypeEvent.findOne({ where: { id: id } })
        if (!data) throw new customError('TypeEventNotFound', `${label} not exist`)

        data = await TypeEvent.destroy({ where: { id: id } })
        if (!data) throw new customError('TypeEventAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        // GET ID OF TypeEvent
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS TypeEvent
        let data = await TypeEvent.restore({ where: { id: id } })
        if (!data) throw new customError('TypeEventAlreadyRestored', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}

// IMPORT PICTURE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, './public/imgs/event')
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.split('.').pop() // RETRIEVING THE FILE EXTENSION
        const uniqueFilename = `${Date.now()}_${uuid()}.${extension}` // UNIQUE NAME
        return cb(null, uniqueFilename)
    }
})

exports.upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2Mo
}).single('picture')