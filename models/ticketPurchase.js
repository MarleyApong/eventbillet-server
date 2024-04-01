const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Sale = sequelize.define('Sale', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idTicket: {
         type: DataTypes.SMALLINT,
         allowNull: false
      },
      idSale: {
         type: DataTypes.DOUBLE,
         allowNull: false
      },
      idCustomer: {
         type: DataTypes.STRING(64),
         allowNull: false
      }
   }, { paranoid: true })

   return Sale
}