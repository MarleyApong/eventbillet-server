const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const TicketCategory = sequelize.define('Ticket-Category', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false
      }
   }, { paranoid: true })

   return TicketCategory
}