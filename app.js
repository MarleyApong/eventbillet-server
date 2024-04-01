const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const sequelize = require('./config/db')
const seedDB = require('./seeders')
const fs = require('fs')
require('./associations')


//GET ALL ROUTES
const errorHandler = require('./middlewares/errorHandler')
const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')

// CREATE SERVER
const app = express()

app.use(cors())

// UPGRADE PROTECTION
app.use(helmet({
    contentSecutityPolicy: true
}))

// CONFIGURATION API && AUTHORIZATION
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('combined'))

// STATIC IMAGES FOLDER
app.use(express.static('public'))

// ROUTES
app.get('/', (req, res) => {
    res.send('Welcome !')
})

app.use('/auth', authRouter)
app.use('/users', usersRouter)

// ROUTE NOT FOUND
app.use((req, res, next) => {
    res.status(404).send("Fuck you !")
})

const createDirectoryIfNotExists = (directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath)
        console.log(`Directory '${directoryPath}' created successfully.`)
    } 
    else {
        console.log(`Directory '${directoryPath}' already exists.`)
    }
}

// CREATE FOLDER 'public', 'imgs', 'product' and 'profile' IF NOT EXIST
createDirectoryIfNotExists('./public')
createDirectoryIfNotExists('./public/imgs')
createDirectoryIfNotExists('./public/imgs/event')
createDirectoryIfNotExists('./public/imgs/profile')

// SYNCHRONIZATION
const init = async () => {
    try {
        await sequelize.sync({ alter: true })
        console.log("All models have been successfully synced !")

        await seedDB()
        console.log("Tables have been initialized by defaut !")
    } catch (err) {
        console.error("Error during initialization: ", err)
    }
}
init()

// MANAGER ERROR
app.use(errorHandler)

// SYNCHRONISATION
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server started at address [http://localhost:${process.env.SERVER_PORT || 4000}] !`)
})