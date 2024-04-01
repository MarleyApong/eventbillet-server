const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Customer = sequelize.define('Customer', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      email: {
         type: DataTypes.STRING(45),
         defaultValue: '',
         allowNull: false,
         validate: {
            isEmail: true  // VALIDATE EMAIL DATA 
         }
      },
      password: {
         type: DataTypes.STRING(64),
         defaultValue: '',
         allowNull: false,
         is: /^[0-9a-f]{64}$/i // CONSTRAINT PASSWORD
      }
   }, { paranoid: true })

   return Customer
}