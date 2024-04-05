const bcrypt = require("bcrypt")
const { v4: uuid } = require("uuid")
const { Role, Status, Env, User } = require("../models")

module.exports = async () => {
   // SEEDERS STATUS DEFAUT
   try {
      let status = await Status.findAll()
      if (status.length == 0) {
         status = await Status.bulkCreate([
            {
               id: 1,
               name: 'active'
            },
            {
               id: 2,
               name: 'inactive'
            }
         ])

         if (!status) console.error('===================Error init status defauld !===================')
         console.log('===================Status defauld created !===================')
      }
      console.log('===================Status defauld initialized !===================')

      // SEEDERS ROLES DEFAUT
      let roles = await Role.findAll()
      if (roles.length == 0) {
         roles = await Role.bulkCreate([
            {
               id: 1,
               name: 'super admin'
            },
            {
               id: 2,
               name: 'admin'
            },
            {
               id: 3,
               name: 'simple user'
            }
         ])

         if (!roles) console.error('Error init roles defauld !')
         console.log('===================Roles defauld created !===================')
      }
      console.log('===================Roles defauld initialized !===================')

      // SEEDERS ENVS DEFAUT
      let envs = await Env.findAll()
      if (envs.length == 0) {
         envs = await Env.bulkCreate([
            {
               id: 1,
               name: 'internal'
            },
            {
               id: 2,
               name: 'external'
            }
         ])

         if (!envs) console.error('===================Error init envs defauld !===================')
         console.log('===================Envs defauld created !===================')
      }
      console.log('===================Envs defauld initialized !===================')

      // SEEDERS USERS DEFAUT
      let user = await User.findOne({ where: { email: "marlexapong90@gmail.com" } })

      if (!user) {
         const hash = await bcrypt.hash("Marley@123", parseInt(process.env.BCRYPT_SALT_ROUND))
         if (!hash) console.error("===================Error hash password user defauld !===================")

         user = await User.create({
            id: uuid(),
            idRole: 1,
            idEnv: 1,
            idStatus: 1,
            firstName: "apong",
            lastName: "marley",
            phone: "655371420",
            email: "marlexapong90@gmail.com",
            password: hash,
         })
         if (!user) console.error("===================Error init user defauld !===================")

         console.log("===================User by defauld created !===================")
      }
      console.log("===================User already init !===================")
   } catch (err) {

   }
}