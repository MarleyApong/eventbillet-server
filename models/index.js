const sequelize = require('../config/db')
const db = {}

db.Env = require('./env')(sequelize)
db.Role = require('./role')(sequelize)
db.Status = require('./status')(sequelize)
db.LogsUser = require('./logUser')(sequelize)
db.User = require('./user')(sequelize)
db.Customer = require('./customer')(sequelize)
db.Event = require('./event')(sequelize)
db.TypeEvent = require('./typeEvent')(sequelize)
db.Ticket = require('./ticket')(sequelize)
db.TicketCategory = require('./ticketCategory')(sequelize)
db.TicketPurchase = require('./ticketPurchase')(sequelize)
db.Sale = require('./sale')(sequelize)
db.ManagerEvent = require('./managerEvent')(sequelize)

module.exports = db