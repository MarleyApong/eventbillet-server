const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
   const Env = sequelize.define("Env", {
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

   return Env
}