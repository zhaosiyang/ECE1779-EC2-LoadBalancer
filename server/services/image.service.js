import {Utils} from './utils';
import {ErrorHandler} from './errorHandler';
import * as fs from 'fs';
const gm = require('gm').subClass({imageMagick: true});

export class ImageService {

  static _identifyAsPromise(path) {
    return new Promise((resolve, reject) => {
      gm(path).identify((err, data) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(data);
        }
      })
    });
  }

  static _resizeAsPromise(filePath, originalname, width, suffix, data, id) {

    const promise = new Promise((resolve, reject) => {
      const dstPath = Utils.transformPath(filePath, originalname, suffix, id);
      gm(filePath).resize(width).write(dstPath, err => {
        if (err) {
          reject(err);
        }
        else {
          data._paths = data._paths || [];
          data._paths.push(dstPath);
          resolve(data);
        }
      });
    });
    return promise;
  }

  // store 3 more resized pictures and set req._newPaths to be an array of the 4 new paths
  static resizeMiddleware() {
    const RATIO1 = 0.1;
    const RATIO2 = 0.5;
    const RATIO3 = 2;
    const id = Date.now().toString();
    return (req, res, next) => {
      if (!req.file || !req.file.path) {
        return res.status(400).end();
      }
      this._identifyAsPromise(req.file.path)
        .then(data => this._resizeAsPromise(req.file.path, req.file.originalname, parseInt(RATIO1 * data.width), 'micro', data, id))
        .then(data => this._resizeAsPromise(req.file.path, req.file.originalname, parseInt(RATIO2 * data.width), 'small', data, id))
        .then(data => this._resizeAsPromise(req.file.path, req.file.originalname, parseInt(RATIO3 * data.width), 'big', data, id))
        .then(data => this._resizeAsPromise(req.file.path, req.file.originalname, parseInt(data.width), 'original', data, id))
        .then(data => {
          req._newPaths = data._paths;
        })
        .then(Utils.goNext(next))
        .catch(ErrorHandler.handleError(res))
    }
  }

  static deleteCachedImagesMiddleware() {
    return (req, res, next) => {
      req._newPaths.forEach(p => fs.unlinkSync(p));
      fs.unlinkSync(req.file.path);
      next();
    }
  }

}
