const express = require('express')
const ctrl = require('../controllers/env')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE EVENT
router.get('/', checkToken, ctrl.getAll)

module.exports = router