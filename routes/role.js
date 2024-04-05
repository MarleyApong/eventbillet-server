const express = require('express')
const ctrl = require('../controllers/role')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE ROLE
router.get('/', checkToken, ctrl.getAll)

module.exports = router