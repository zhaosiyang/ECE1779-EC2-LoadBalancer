export class Responder {

  static respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
      res.status(statusCode).json(entity);
    };
  }

  static respondWithBlankBody(res) {
    return () => res.status(200).end();
  }

}

