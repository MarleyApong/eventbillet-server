const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Ticket = sequelize.define('Ticket', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idTicketCategory: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false
      },
      price: {
         type: DataTypes.FLOAT,
         allowNull: false
      },
      numberId: {
         type: DataTypes.STRING,
         allowNull: false
      }
   }, { paranoid: true })

   return Ticket
}