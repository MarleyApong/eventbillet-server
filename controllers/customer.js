const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Customer } = require('../models')
const customError = require('../hooks/customError')

let label = "customer"

// ROUTING RESSOURCE Customer
// GET ALL Customers
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

      const data = await Customer.findAll({
         attributes: { exclude: ['password'] },
         where: whereClause,
         limit: limit,
         offset: (page - 1) * limit,
         order: [[filter, sort]],
      })

      // TOTAL Customer
      const totalElements = await data.length

      if (!data) throw new customError('CustomersNotFound', `${label} not found`)

      return res.json({
         content: {
            data: data,
            totalpages: Math.ceil(totalElements / limit),
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

// GET ONE Customer
exports.getOne = async (req, res, next) => {
   try {
      // GET ID OF Customer
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameters')

      let data = await Customer.findOne({
         where: { id: id }
      })
      if (!data) throw new customError('CustomerNotFound', `${label} not found`)

      return res.json({ content: data })
   }
   catch (err) {
      next(err)
   }
}

// AUTHENTIFICATION
exports.signIn = async (req, res, next) => {
   try {
      const { email, password } = req.body
      console.log("req.body ",req.body);
      if (!email || !password) throw new customError('MissingData', 'missing data')

      const customer = await Customer.findOne({
         attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt']
         },
         where: { email: email }
      })
      if (!customer) throw new customError('CustomerAutNotFound', `the customer with ${email} does not exit`)

      // FULL PARAMETER
      const hash = await bcrypt.compare(password, customer.password)
      if (!hash) throw new customError('ProcessHashFailed', 'wrong password')

      // GENERED TOKEN
      const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_DURING, algorithm: process.env.JWT_ALGORITHM })

      return res.json({
         customer: {
            id: customer.id,
         },
         token: token
      })
   }
   catch (err) {
      next(err)
   }
}

// CREATE
exports.signUp = async (req, res, next) => {
   try {
      // GET NEW ID Customer
      const id = uuid()

      // GET DATA FOR ADD Customer
      const { email, password } = req.body

      if (!email || !password) throw new customError('MissingData', 'Missing Data')
      let data = await Customer.findOne({ where: { email: email } })

      if (data) throw new customError('CustomerAlreadyExist', `${label} with ${email} already exists`)
      const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      const isValidPassword = regexPassword.test(password)

      if (!isValidPassword) throw new customError('RegexPasswordValidationError', `the password does not meet security requirements`)
      let hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND))
      if (!hash) throw new customError('ProcessHashFailed', `${label} processing hash failed`)

      data = await Customer.create({
         id: id,
         email: email,
         password: hash
      })
      if (!data) throw new customError('AddCustomerError', `${label} does not created`,)

      return res.status(201).json({ message: `${label} created`, data: data })
   }
   catch (err) {
      next(err)
   }
}

exports.checkEmail = async (req, res, next) => {
   try {
      // GET ID OF Customer
      const { email } = req.body

      // CHECH THIS Customer
      let data = await Customer.findOne({ where: { email: email } })
      if (!data) throw new customError('CustomerNotFound', `this ${label} does not exist`)

      return res.json({ userId: data.id, message: 'password modified' })
   }
   catch (err) {
      next(err)
   }
}


exports.changePassword = async (req, res, next) => {
   try {
      // GET ID OF Customer
      const { lastPassword, newPassword } = req.body

      // CHECH THIS Customer
      let data = await Customer.findOne({ where: { id: id } })
      if (!data) throw new customError('CustomerNotFound', `this ${label} does not exist`)

      // COMPARE PASSWORD
      const compare = await bcrypt.compare(lastPassword, data.password)
      if (!compare) throw new customError('ProcessCompareFailed', 'wrong password')

      const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      const isValidPassword = regexPassword.test(newPassword)

      if (!isValidPassword) throw new customError('RegexPasswordValidationError', `the password does not meet security requirements`)

      const hash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUND))
      if (!hash) throw new customError('ProcessHashFailed', 'wrong password')

      data = await Customer.update({ password: hash }, { where: { id: id } })
      if (!data) throw new customError('PasswordCustomerUpdateError', `${label} does not modified`)
      return res.json({ message: 'password modified' })
   }
   catch (err) {
      next(err)
   }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
   try {
      // GET ID OF Customer
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECK THIS Customer
      let data = await Customer.findOne({ where: { id: id } })
      if (!data) throw new customError('CustomerNotFound', `${label} not exist`)

      data = await Customer.destroy({ where: { id: id }, force: true })
      if (!data) throw new customError('CustomerAlreadyDeleted', `${label} not deleted`)

      return res.json({ message: `${label} deleted` })
   }
   catch (err) {
      next(err)
   }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
   try {
      // GET ID OF Customer
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECK THIS Customer
      let data = await Customer.findOne({ where: { id: id } })
      if (!data) throw new customError('CustomerNotFound', `${label} not exist`)

      data = await Customer.destroy({ where: { id: id } })
      if (!data) throw new customError('CustomerAlreadyDeleted', `${label} not deleted`)

      return res.json({ message: `${label} deleted` })
   }
   catch (err) {
      next(err)
   }
}

// UNTRASH
exports.restore = async (req, res, next) => {
   try {
      // GET ID OF Customer
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'missing parameter')

      // CHECK THIS Customer
      let data = await Customer.restore({ where: { id: id } })
      if (!data) throw new customError('CustomerAlreadyRestored', `${label} already restored or does not exist`)

      return res.json({ message: `${label} restored` })
   }
   catch (err) {
      next(err)
   }
}