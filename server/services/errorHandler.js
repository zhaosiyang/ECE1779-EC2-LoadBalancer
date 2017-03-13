export class ErrorHandler {

  static createErrorWithMessageAndStatusCode(message, statusCode) {
    const err = new Error(message);
    err.statusCode = statusCode || 500;
    return err;
  }

  static throwOnEntityNotFound(entityName) {
    entityName = entityName || '';
    return function(entity) {
      if(!entity) {
        throw ErrorHandler.createErrorWithMessageAndStatusCode(entityName + ' not found!', 404);
      }
      return entity;
    };
  }

  static handleError(res) {
    return function(err) {
      console.error(err);
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({message: err.message});
    };
  }

}
