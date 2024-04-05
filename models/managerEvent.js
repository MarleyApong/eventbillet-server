const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const ManagerEvent = sequelize.define('Manager-Event', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idEvent: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idUser: {
         type: DataTypes.STRING(64),
         allowNull: false
      }
   }, { paranoid: true })

   return ManagerEvent
}