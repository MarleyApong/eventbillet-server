const express = require('express')
const ctrl = require('../controllers/status')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE STATUS
router.get('/', checkToken, ctrl.getAll)

module.exports = router