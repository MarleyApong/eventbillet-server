const bcrypt = require('bcrypt')
const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { User, Organizations, Companies, Status, Role, Env } = require('../models')
const customError = require('../hooks/customError')

let label = "user"

// ROUTING RESSOURCE USER
// GET ALL USERS
exports.getAll = async (req, res, next) => {
   const page = parseInt(req.query.page) || 1
   const limit = parseInt(req.query.limit) || 10
   const status = req.query.status
   const role = req.query.role
   const env = req.query.env
   const sort = req.query.sort || 'desc'
   const filter = req.query.filter || 'createdAt'
   const keyboard = req.query.k

   try {
      let whereClause = {}

      if (status) whereClause.idStatus = status
      if (role) whereClause.idRole = role
      if (env) whereClause.idEnv = env

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

      const data = await User.findAll({
         include: [
            {
               model: Status,
               attributes: ['id', 'name']
            },
            {
               model: Role,
               attributes: ['id', 'name']
            },
            {
               model: Env,
               attributes: ['id', 'name']
            },
         ],
         attributes: { exclude: ['password'] },
         where: whereClause,
         limit: limit,
         offset: (page - 1) * limit,
         order: [[filter, sort]],
      })

      // TOTAL USER
      const totalElements = await data.length

      // TOTAL ACTIVE USER 
      const inProgress = await User.count({
         include: [
            {
               model: Status,
               where: { name: 'active' }
            }
         ]
      })

      // TOTAL INACTIVE USER
      const blocked = await User.count({
         include: [
            {
               model: Status,
               where: { name: 'inactive' }
            }
         ]
      })

      // TOTAL USER WHERE ENV IS EXTERNAL
      const totalElementsExternal = await User.count({
         include: [
            {
               model: Env,
               attributes: ['id', 'name'],
               where: { name: 'external' }
            }
         ]
      })
      if (!data) throw new customError('UsersNotFound', `${label} not found`)

      return res.json({
         content: {
            data: data,
            totalpages: Math.ceil(totalElements / limit),
            currentElements: data.length,
            totalElements: totalElements,
            totalElementsExternal: totalElementsExternal,
            inProgress: inProgress,
            blocked: blocked,
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

// GET ONE USER
exports.getOne = async (req, res, next) => {
   try {
      // GET ID OF USER
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameters')

      let data = await User.findOne({
         where: { id: id },
         include: [
            {
               model: Status,
               attributes: ['id', 'name']
            },
            {
               model: Role,
               attributes: ['id', 'name']
            },
            {
               model: Env,
               attributes: ['id', 'name']
            },
         ]
      })
      if (!data) throw new customError('UserNotFound', `${label} not found`)

      return res.json({ content: data })
   }
   catch (err) {
      next(err)
   }
}

// CREATE
exports.add = async (req, res, next) => {
   try {
      // GET NEW ID USER
      const id = uuid()

      // GET DATA FOR ADD USER
      const { idRole, idEnv, idStatus, firstName, lastName, phone, email, password } = req.body

      if (!idRole || !env || !idStatus || !firstName || !phone || !email || !password) throw new customError('MissingData', 'Missing Data')
      let data = await User.findOne({ where: { email: email } })

      if (data) throw new customError('UserAlreadyExist', `${label} with ${email} already exists`)
      const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      const isValidPassword = regexPassword.test(password)

      if (!isValidPassword) throw new customError('RegexPasswordValidationError', `the password does not meet security requirements`)
      let hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND))
      if (!hash) throw new customError('ProcessHashFailed', `${label} processing hash failed`)

      data = await User.create({
         id: id,
         idRole: idRole,
         idEnv: idEnv,
         idStatus: idStatus,
         firstName: firstName,
         lastName: lastName,
         phone: phone,
         email: email,
         password: hash
      })
      if (!data) throw new customError('AddUserError', `${label} does not created`,)

      return res.status(201).json({ message: `${label} created`, data: data })
   }
   catch (err) {
      next(err)
   }
}

// PATCH
exports.update = async (req, res, next) => {
   try {
      // GET ID OF USER
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECK THIS USER
      let data = await User.findOne({ where: { id: id } })
      if (!data) throw new customError('UserNotFound', `this ${label} does not exist`)

      data = await User.update(req.body, { where: { id: id } })
      if (!data) throw new customError('UserUpdateError', `${label} does  not modified`)
      return res.json({ message: `${label} modified` })
   }
   catch (err) {
      next(err)
   }
}

// PATCH STATUS
exports.changeStatus = async (req, res, next) => {
   try {
      // GET ID OF USER
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECK THIS USER
      let data = await User.findOne({
         where: { id: id },
         include: [
            { model: Status }
         ]
      })

      if (!data) throw new customError('UserNotFound', `this ${label} does not exist`)

      let idStatus = 1
      if (data.Status.id === 1) idStatus = 2

      data = await User.update({ idStatus: data.id }, { where: { id: idStatus } })
      if (!data) throw new customError('StatusUserUpdateError', `${label} not modified`)

      return res.json({ message: `${label} ${idStatus === 1 ? 'active' : 'inactive'}` })
   }
   catch (err) {
      next(err)
   }
}

// PATCH ROLES
exports.changeRole = async (req, res, next) => {
   try {
      // GET ID OF USER
      const id = req.params.id
      const idRole = req.params.role
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECK THIS USER
      let data = await User.findOne({ where: { id: id } })
      if (!data) throw new customError('UserNotFound', `this ${label} does not exist`)

      data = await User.update({ idRole: idRole }, { where: { id: id } })
      if (!data) throw new customError('RoleUpdateError', `${label} not modified`)
      return res.json({ message: `Role modified` })
   }
   catch (err) {
      next(err)
   }
}

exports.changePassword = async (req, res, next) => {
   try {
      // GET ID OF USER
      const id = req.params.id
      const { lastPassword, newPassword } = req.body
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECH THIS USER
      let data = await User.findOne({ where: { id: id } })
      if (!data) throw new customError('UserNotFound', `this ${label} does not exist`)

      // COMPARE PASSWORD
      const compare = await bcrypt.compare(lastPassword, data.password)
      if (!compare) throw new customError('ProcessCompareFailed', 'wrong password')

      const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      const isValidPassword = regexPassword.test(newPassword)

      if (!isValidPassword) throw new customError('RegexPasswordValidationError', `the password does not meet security requirements`)

      const hash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUND))
      if (!hash) throw new customError('ProcessHashFailed', 'wrong password')

      data = await User.update({ password: hash }, { where: { id: id } })
      if (!data) throw new customError('PasswordUserUpdateError', `${label} does not modified`)
      return res.json({ message: 'password modified' })
   }
   catch (err) {
      next(err)
   }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
   try {
      // GET ID OF USER
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECK THIS USER
      let data = await User.findOne({ where: { id: id } })
      if (!data) throw new customError('UserNotFound', `${label} not exist`)

      data = await User.destroy({ where: { id: id }, force: true })
      if (!data) throw new customError('UserAlreadyDeleted', `${label} not deleted`)

      return res.json({ message: `${label} deleted` })
   }
   catch (err) {
      next(err)
   }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
   try {
      // GET ID OF USER
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECK THIS USER
      let data = await User.findOne({ where: { id: id } })
      if (!data) throw new customError('UserNotFound', `${label} not exist`)

      data = await User.destroy({ where: { id: id } })
      if (!data) throw new customError('UserAlreadyDeleted', `${label} not deleted`)

      return res.json({ message: `${label} deleted` })
   }
   catch (err) {
      next(err)
   }
}

// UNTRASH
exports.restore = async (req, res, next) => {
   try {
      // GET ID OF USER
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECK THIS USER
      let data = await User.restore({ where: { id: id } })
      if (!data) throw new customError('UserAlreadyRestored', `${label} already restored or does not exist`)

      return res.json({ message: `${label} restored` })
   } 
   catch (err) {
      next(err)
   }
}