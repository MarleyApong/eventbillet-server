const express = require('express')
const ctrl = require('../controllers/customer')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE CUSTOMER
router.get('/', checkToken, ctrl.getAll)
router.get('/:id', ctrl.getOne)
router.post('/sign-in', ctrl.signIn)
router.post('/sign-up', ctrl.signUp)
router.post('/check-email', ctrl.checkEmail)
router.patch('/change-password', ctrl.changePassword)
router.patch('/:id/restore', checkToken, ctrl.restore)
router.delete('/:id', checkToken, ctrl.deleteTrash)

module.exports = router