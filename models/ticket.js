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
      prix: {
         type: DataTypes.FLOAT,
         allowNull: false
      },
      number: {
         type: DataTypes.STRING,
         allowNull: false
      }
   }, { paranoid: true })

   return Ticket
}