const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const TicketPurchase = sequelize.define('Ticket-Purchase', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idTicket: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idSale: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idCustomer: {
         type: DataTypes.STRING(64),
         allowNull: false
      }
   }, { paranoid: true })

   return TicketPurchase
}