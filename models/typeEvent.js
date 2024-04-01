const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const TypeEvent = sequelize.define('TypeEvent', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false
      }
   }, { paranoid: true })

   return TypeEvent
}