var express = require('express');
import {MysqlService} from '../services/mysql.service';
import {Responder} from '../services/responder';
import {ErrorHandler} from '../services/errorHandler';
const router = express.Router();

router.get('/', function (req, res, next) {
  MysqlService.models.AdminConfig.findOne()
    .then(ErrorHandler.throwOnEntityNotFound('AdminConfig'))
    .then(Responder.respondWithResult(res))
    .catch(ErrorHandler.handleError(res))
});

router.put('/', function (req, res, next) {
  const updates = {};
  if (req.body.autoScale) {
    updates.autoScale = req.body.autoScale === 'true' ? true : false
  }
  if (req.body.cpuExpandingThreshold) {
    updates.cpuExpandingThreshold = parseInt(req.body.cpuExpandingThreshold);
  }
  if (req.body.cpuShrinkingThreshold) {
    updates.cpuShrinkingThreshold = parseInt(req.body.cpuShrinkingThreshold);
  }
  if (req.body.expandingRatio) {
    updates.expandingRatio = parseInt(req.body.expandingRatio);
  }
  if (req.body.shrinkingRatio) {
    updates.shrinkingRatio = parseInt(req.body.shrinkingRatio);
  }
  MysqlService.models.AdminConfig.findOne()
    .then(ErrorHandler.throwOnEntityNotFound('AdminConfig'))
    .then(entry => entry.update(updates))
    .then(Responder.respondWithResult(res))
    .catch(ErrorHandler.handleError(res));
});

module.exports = router;