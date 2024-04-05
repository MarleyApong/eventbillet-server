const {
Customer,
Env,
Event,
LogsUser,
ManagerEvent,
Role,
Sale,
Status,
Ticket,
TicketCategory,
TicketPurchase,
TypeEvent,
User 
} = require('../models')

// USER <- STATUS
Status.hasMany(User, { foreignKey: 'idStatus' })
User.belongsTo(Status, { foreignKey: 'idStatus' })

// USER <- ENVS
Env.hasMany(User, { foreignKey: 'idEnv' })
User.belongsTo(Env, { foreignKey: 'idEnv' })

// USER <- ROLES
Role.hasMany(User, { foreignKey: 'idRole' })
User.belongsTo(Role, { foreignKey: 'idRole' })

// USER -> LOGUSERS
User.hasMany(LogsUser, { foreignKey: 'idUser' })
LogsUser.belongsTo(User, { foreignKey: 'idUser' })

// USER -> MANAGEREVENT
User.hasMany(ManagerEvent, { foreignKey: 'idUser' })
ManagerEvent.belongsTo(User, { foreignKey: 'idUser' })

// ENVENT <- TYPEEVENT
TypeEvent.hasMany(Event, {foreignKey: 'idTypeEvent'})
Event.belongsTo(TypeEvent, {foreignKey: 'idTypeEvent'})

// EVENT -> MANAGEREVENT
Event.hasMany(ManagerEvent, { foreignKey: 'idEvent' })
ManagerEvent.belongsTo(Event, { foreignKey: 'idEvent' })

// TICKET <- TICKETCATEGORY
TicketCategory.hasMany(Ticket, {foreignKey: 'idTicketCategory'})
Ticket.belongsTo(TicketCategory, {foreignKey: 'idTicketCategory'})

// TICKETPURCHASE <- TICKET
// TICKETPURCHASE <- SALE
// TICKETPURCHASE <- CUSTOMER
TicketPurchase.belongsTo(Ticket, {foreignKey: 'idTicket'})
TicketPurchase.belongsTo(Sale, {foreignKey: 'idSale'})
TicketPurchase.belongsTo(Customer, {foreignKey: 'idCustomer'})
Ticket.hasMany(TicketPurchase, {foreignKey: 'idTicket'})
Sale.hasMany(TicketPurchase, {foreignKey: 'idSale'})
Customer.hasMany(TicketPurchase, {foreignKey: 'idCustomer'})
