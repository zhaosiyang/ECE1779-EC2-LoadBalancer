import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import {Responder} from './responder';
import {ErrorHandler} from './errorHandler';
import {awsInstanceConfig} from '../config';
import {Utils} from './utils';
import * as path from 'path';

export class AwsService {

  static BUCKET = 'ece1779a1-images';
  static IMAGE_FOLDER = 'image';

  constructor() {
    AWS.config.update({region: 'us-west-2'});
    this.ec2 = new AWS.EC2();
    this.s3 = new AWS.S3();
    this.cloudWatch = new AWS.CloudWatch();
  }

  static get singleton() {
    if (this._singleton) {
      return this._singleton;
    }
    else {
      this._singleton = new AwsService();
      return this._singleton;
    }
  }

  static describeEc2InstancesMiddleware() {
    return (req, res, next) => {
      this.singleton.ec2.describeInstances().promise()
        .then(Responder.respondWithResult(res))
        .catch(ErrorHandler.handleError(res));
    }
  }

  static createEc2InstanceMiddleware() {
    return (req, res, next) => {
      let awsInstanceConfigCopy;
      if (req.body.number) {
        awsInstanceConfigCopy = Object.assign({}, awsInstanceConfig, {MaxCount: req.body.number, MinCount: req.body.number});
      }
      else {
        awsInstanceConfigCopy = awsInstanceConfig;
      }
      console.log('awsInstanceConfigCopy', awsInstanceConfigCopy);
      this.singleton.ec2.runInstances(awsInstanceConfigCopy).promise()
        .then(Responder.respondWithResult(res))
        .catch(ErrorHandler.handleError(res));
    }
  }

  static startEc2InstanceMiddleware() {
    return (req, res, next) => {
      const instanceId = req.params.instanceId;
      this.singleton.ec2.startInstances({InstanceIds: [instanceId]}).promise()
        .then(Responder.respondWithResult(res))
        .catch(ErrorHandler.handleError(res));
    }
  }

  static stopEc2InstanceMiddleware() {
    return (req, res, next) => {
      const instanceId = req.params.instanceId;
      this.singleton.ec2.stopInstances({InstanceIds: [instanceId]}).promise()
        .then(Responder.respondWithResult(res))
        .catch(ErrorHandler.handleError(res));
    }
  }

  static terminateEc2InstanceMiddleware() {
    return (req, res, next) => {
      const instanceId = req.params.instanceId;
      this.singleton.ec2.terminateInstances({InstanceIds: [instanceId]}).promise()
        .then(Responder.respondWithResult(res))
        .catch(ErrorHandler.handleError(res));
    }
  }

  static rebootEc2InstanceMiddleware() {
    return (req, res, next) => {
      const instanceId = req.params.instanceId;
      this.singleton.ec2.rebootInstances({InstanceIds: [instanceId]}).promise()
        .then(Responder.respondWithResult(res))
        .catch(ErrorHandler.handleError(res));
    }
  }

  static putObjectsToS3Middleware() {
    return (req, res, next) => {
      let promise = Promise.resolve();
      for (let i = 0; i < req._newPaths.length; i++) {
        promise = promise.then(() => {
          const options = {
            Bucket: this.BUCKET,
            Key: path.join(this.IMAGE_FOLDER, path.basename(req._newPaths[i])),
            Body: fs.createReadStream(req._newPaths[i])
          };
          console.log('putting object');
          return this.singleton.s3.putObject(options).promise();
        });
      }

      promise.then(Utils.goNext(next))
        .catch(ErrorHandler.handleError(res));
    }
  }

  static describeCloudWatchAlarmsMiddleware() {
    return (req, res, next) => {
      this.singleton.cloudWatch.describeAlarms().promise()
        .then(Responder.respondWithResult(res))
        .then(ErrorHandler.handleError(res));
    }
  }

  static createNewInstances() {

  }

  // static createOrUpdateCloudWatchCpuUnitlizationAlarmMiddleware() {
  //   return (req, res, next) => {
  //
  //   }
  // }

}

