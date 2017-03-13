import * as path from 'path';

export class Utils {
  static goNext(next) {
    return function () {
      next();
    }
  }

  static transformPath(filePath, originalname, suffix, id) {
    const ext = path.extname(originalname);
    const newFilename = originalname.slice(0, -ext.length) + '-' + id + '-' + suffix + ext;
    return path.join(filePath, '..', newFilename);
  }

}
