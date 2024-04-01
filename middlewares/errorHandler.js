module.exports = (err, req, res, next) => {

   /*
      debugLevel = 0 => JUSTE MESSAGE ON ERROR IS RETURN
      debugLevel = 1 => ALL INFORMATIONS ON ERROR
   */

   let debugLevel = 0
   let debugMessage = "Limit error return by the supervisor. Contact him for more details on the problem !"
   let status = 500
   let message = "Internal server error"
   console.error('New error :', err)

   if (err.name === 'SequelizeValidationError') {
      message = 'Database connection error'
      status = 400
   }
   else if (err.name === 'RegexPasswordValidationError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'MissingData') {
      message = err.message
      status = 400
   }
   else if (err.name === 'MissingParams') {
      message = err.message
      status = 400
   }
   else if (err.name === 'ProcessHashFailed') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'BadRequest') {
      message = err.message
      status = 400
   }
   else if (err.name === 'CustomerAlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'CustomerAlreadyDeleted') {
      message = err.message
      status = 400
   }
   else if (err.name === 'CustomerAlreadyRestored') {
      message = err.message
      status = 400
   }
   else if (err.name === 'UserAlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'UserUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'StatusUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'RoleUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'PasswordUserUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'UserAlreadyDeleted') {
      message = err.message
      status = 400
   }
   else if (err.name === 'UserAlreadyRestored') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AddUserError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AddLimitReached') {
      message = err.message
      status = 401
   }
   else if (err.name === 'NotAuthorizedToModified') {
      message = err.message
      status = 401
   }
   else if (err.name === 'AccessForbidden') {
      message = err.message
      status = 403
   }
   else if (err.name === 'NotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'EnvsNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'StatusNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'UsersNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'UserNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'SequelizeUniqueConstraintError') {
      message = 'Single Constraint Violation'
      status = 409
   }
   else if (err.name === 'SequelizeForeignKeyConstraintError') {
      message = 'Foreign key constraint violation'
      status = 409
   }
   else if (err.name === 'SequelizeConnectionError') {
      message = 'Data validation error'
      status = 503
   }

   return res.status(status).json({
      message: message,
      name: err.name,
      error: debugLevel === 0 ? '' : err,
      infos: debugLevel === 0 ? debugMessage : ''
   })
}