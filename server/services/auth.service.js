'use strict';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import {jwtSecret} from '../config';
import {MysqlService} from './mysql.service';
import {Responder} from './responder';
import * as bcrypt from 'bcryptjs';
import {ErrorHandler} from './errorHandler';

const validateJwt = expressJwt({
  secret: jwtSecret
});

export class AuthService {

  static isAuthenticatedMiddleware() {
    return compose()
    // Validate jwt
      .use(function (req, res, next) {
        // allow access_token to be passed through query parameter as well
        if (req.query && req.query.hasOwnProperty('access_token')) {
          req.headers.authorization = `Bearer ${req.query.access_token}`;
        }
        // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
        if (req.query && typeof req.headers.authorization === 'undefined') {
          req.headers.authorization = `Bearer ${req.cookies.token}`;
        }
        validateJwt(req, res, next);
      })
      // Attach user to request
      .use(function (req, res, next) {
        MysqlService.models.User.findById(req.user.id)
          .then(user => {
            if (!user) {
              return res.status(401).end();
            }
            req.user = user;
            next();
          })
          .catch(err => next(err));
      });
  }

  static isAdminMiddleWare() {
    return compose()
      .use(this.isAuthenticatedMiddleware())
      .use(function (req, res, next) {
        if (req.user.username === 'admin') {
          return next();
        } else {
          return res.status(403).send({"message": "permission denied"});
        }
      });
  }

  static _signTokenImplement(user) {
    return jwt.sign({id: user.id, username: user.username}, jwtSecret, {
      expiresIn: 60 * 60 * 24 * 365
    });
  }

  static signToken() {
    return (user) => {
      return {token: this._signTokenImplement(user)};
    }
  }

  static _authenticatePasswordAndThrowOnFail(password) {
    return user => {
      if (bcrypt.compareSync(password, user.password)) {
        return user;
      }
      else {
        throw ErrorHandler.createErrorWithMessageAndStatusCode('wrong password', 403);
      }
    }
  }

  static authenticatePasswordMiddleware() {
    return (req, res) => {
      const username = req.body.username;
      const password = req.body.password;
      MysqlService.models.User.findOne({where: {username}})
        .then(ErrorHandler.throwOnEntityNotFound('user'))
        .then(this._authenticatePasswordAndThrowOnFail(password))
        .then(this.signToken())
        .then(Responder.respondWithResult(res))
        .catch(ErrorHandler.handleError(res));
    }
  }
}
