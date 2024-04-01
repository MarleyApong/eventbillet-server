const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Event = sequelize.define('Event', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idTypeEvent: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false
      },
      nbPlace: {
         type: DataTypes.INTEGER(5),
         allowNull: false
      },
      startDate: {
         type: DataTypes.DATE,
         allowNull: false
      },
      endDate: {
         type: DataTypes.DATE,
         allowNull: false
      }
   }, { paranoid: true })

   return Event
}