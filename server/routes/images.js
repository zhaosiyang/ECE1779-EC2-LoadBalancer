var express = require('express');
const multer = require('multer');
const upload = multer({
  dest: path.join(__dirname, '../image_cache'),
});
import * as path from 'path';

import {AuthService} from '../services/auth.service';
import {ErrorHandler} from '../services/errorHandler';
import {Responder} from '../services/responder';
import {MysqlService} from '../services/mysql.service';
import {AwsService} from '../services/aws.service';
import {ImageService} from '../services/image.service';

const router = express.Router();

router.get('/my-images', AuthService.isAuthenticatedMiddleware(), function (req, res) {
  MysqlService.models.Image.findAll({where: {userId: req.user.id}})
    .then(Responder.respondWithResult(res))
    .catch(ErrorHandler.handleError(res))
});

router.get('/:id', AuthService.isAuthenticatedMiddleware(), function (req, res) {
  MysqlService.models.Image.findById(req.params.id)
    .then(ErrorHandler.throwOnEntityNotFound('image'))
    .then(Responder.respondWithResult(res))
    .catch(ErrorHandler.handleError(res))
});

router.post('/', AuthService.isAuthenticatedMiddleware(), upload.single('file'),
  ImageService.resizeMiddleware(),
  AwsService.putObjectsToS3Middleware(),
  ImageService.deleteCachedImagesMiddleware(),
  function (req, res) {
    const userId = req.user.id;
    const key1 = `https://s3.amazonaws.com/${AwsService.BUCKET}/${AwsService.IMAGE_FOLDER}/${path.basename(req._newPaths[0])}`;
    const key2 = `https://s3.amazonaws.com/${AwsService.BUCKET}/${AwsService.IMAGE_FOLDER}/${path.basename(req._newPaths[1])}`;
    const key3 = `https://s3.amazonaws.com/${AwsService.BUCKET}/${AwsService.IMAGE_FOLDER}/${path.basename(req._newPaths[2])}`;
    const key4 = `https://s3.amazonaws.com/${AwsService.BUCKET}/${AwsService.IMAGE_FOLDER}/${path.basename(req._newPaths[3])}`;

    const Image = MysqlService.models.Image;
    Image.create({userId, key1, key2, key3, key4})
      .then(Responder.respondWithResult(res))
      .catch(ErrorHandler.handleError(res));
  }
);

module.exports = router;
