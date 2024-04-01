const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
   const Role = sequelize.define("Role", {
      id: {
         type: DataTypes.SMALLINT(1),
         primaryKey: true,
         allowNull: false
      },
      name: {
         type: DataTypes.STRING(15),
         allowNull: false,
      },
   })

   return Role
}