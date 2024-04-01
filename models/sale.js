const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Sale = sequelize.define('Sale', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      nbTicketSold: {
         type: DataTypes.SMALLINT,
         allowNull: false
      },
      totalSaleAmount: {
         type: DataTypes.DOUBLE,
         allowNull: false
      }
   }, { paranoid: true })

   return Sale
}