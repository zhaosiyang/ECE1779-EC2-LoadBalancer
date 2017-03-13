var express = require('express');
import {MysqlService} from '../services/mysql.service';
import {Responder} from '../services/responder';
import {ErrorHandler} from '../services/errorHandler';
import {AuthService} from '../services/auth.service';

const router = express.Router();
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', function (req, res, next) {
  const username = req.body.username;
  let password = req.body.password;
  const User = MysqlService.models.User;
  User.create({username, password})
    .then(AuthService.signToken())
    .then(Responder.respondWithResult(res))
    .catch(ErrorHandler.handleError(res));
});

router.post('/login', AuthService.authenticatePasswordMiddleware());

// for testing auth
router.get('/testAuth', AuthService.isAuthenticatedMiddleware(), function (req, res) {
  res.end();
});

// for testing admin auth
router.get('/testAdmin', AuthService.isAdminMiddleWare(), function (req, res) {
  res.end();
});

module.exports = router;
