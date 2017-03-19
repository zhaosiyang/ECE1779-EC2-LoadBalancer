import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import {Responder} from './responder';
import {ErrorHandler} from './errorHandler';
import {awsInstanceConfig, loadBalancerName} from '../config';
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
    this.elb = new AWS.ELB();
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

  // putToLoadBalancer = (data) => {
  //   console.log('in putToLoadBalancer, data.Instances:', data.Instances);
  //   return this.singleton.elb.registerInstancesWithLoadBalancer({
  //     Instances: data.Instances,
  //     LoadBalancerName: loadBalancerName
  //   }).promise();
  // };

  static putToLoadBalancer() {
    return data => {
      console.log(data);
      const params = {
        Instances: data.Instances.map(i => {return {InstanceId: i.InstanceId}}),
        LoadBalancerName: loadBalancerName
      };
      return this.singleton.elb.registerInstancesWithLoadBalancer(params).promise();
    }
  }

  static createEc2InstanceMiddleware(number) {
    return (req, res, next) => {

      number = number || req.body.number || 1;
      let awsInstanceConfigCopy = Object.assign({}, awsInstanceConfig, {MaxCount: number, MinCount: number});

      this.singleton.ec2.runInstances(awsInstanceConfigCopy).promise()
        .then(this.putToLoadBalancer())
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

  static terminateEc2InstancesMiddleware() {
    return (req, res, next) => {
      const instanceIds = req.body.instanceIds;
      this.singleton.ec2.terminateInstances({InstanceIds: instanceIds}).promise()
        .then(Responder.respondWithResult(res))
        .catch(ErrorHandler.handleError(res));
    }
  }

  // no need to call this anymore since when terminating an instance, it's auto deregistered from the ELB
  // static removeInstancesFromLoadBalancerMiddleware() {
  //   return (req, res, next) => {
  //     const params = {
  //       LoadBalancerName: loadBalancerName,
  //       Instances: req.body.instanceIds.map(i => {return {InstanceId: i}})
  //     };
  //     return this.singleton.elb.deregisterInstancesFromLoadBalancer(params).promise()
  //       .then(Responder.respondWithBlankBody(res))
  //       .catch(ErrorHandler.handleError(res));
  //   }
  // }

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

  static bindLoadBalancerMiddleware() {
    return (req, res, next) => {
      return this.singleton.elb.describeLoadBalancers().promise()
        .then(response => {
          const loadBalancers = response['LoadBalancerDescriptions'].filter(l => l.LoadBalancerName = loadBalancerName);
          if (loadBalancers.length === 0) {
            throw Error('cannot find load balancer');
          }
          else {
            req.loadBalancer = loadBalancers[0];
          }
        })
        .then(Utils.goNext(next))
        .catch(ErrorHandler.handleError(res));
    }
  }

  static getCpuUtilizationMiddleware() {
    return (req, res, next) => {
      const EndTime = new Date;
      const StartTime = new Date(EndTime);
      StartTime.setMinutes(StartTime.getMinutes() - 5);
      const params = {
        StartTime,
        EndTime,
        Namespace: 'AWS/EC2',
        MetricName: 'CPUUtilization',
        Period: 300,
        Dimensions: [{
          Name: 'InstanceId',
          Value: req.params.instanceId
        }],
        Statistics: ['Average']
      };
      return this.singleton.cloudWatch.getMetricStatistics(params).promise()
        .then(Responder.respondWithResult(res))
        .catch(ErrorHandler.handleError(res))
    }
  }

  static bindInstanceIdsMiddleware() {
    return (req, res, next) => {
      if (!req.loadBalancer) {
        throw Error('loadBalancer is not bind');
      }
      else {
        req.instanceIds = req.loadBalancer.Instances.map(i => i.InstanceId);
        next();
      }
    }
  }

  static doChangeInstanceNumberMiddleware() {
    return (req, res, next) => {
      const instanceIds = req.instanceIds;
      const numberOfCurrentInstances = instanceIds.length;
      const targetNumber = parseInt(req.body.number);
      const numberDiff = targetNumber - numberOfCurrentInstances;
      if (numberDiff > 0) {
        let awsInstanceConfigCopy = Object.assign({}, awsInstanceConfig, {MaxCount: numberDiff, MinCount: numberDiff});
        this.singleton.ec2.runInstances(awsInstanceConfigCopy).promise()
          .then(this.putToLoadBalancer())
          .then(Responder.respondWithResult(res))
          .catch(ErrorHandler.handleError(res));
      }
      else if (numberDiff < 0) {
        const instanceIdsToRemove = instanceIds.slice(targetNumber);
        this.singleton.ec2.terminateInstances({InstanceIds: instanceIdsToRemove}).promise()
          .then(Responder.respondWithResult(res))
          .catch(ErrorHandler.handleError(res));
      }
      else {
        Responder.respondWithBlankBody(res)();
      }
    }
  }

  static clearBucketMiddleware() {
    return (req, res, next) => {
      this.singleton.s3.listObjects({Bucket: AwsService.BUCKET}).promise()
        .then(response => response.Contents.map(object => {return {Key: object.Key}}))
        .then(Objects => {
          if (Objects.length === 0) {
            return null;
          }
          return this.singleton.s3.deleteObjects({
            Bucket: AwsService.BUCKET,
            Delete: {Objects}
          }).promise();
        })
        .then(Utils.goNext(next))
        .catch(ErrorHandler.handleError(res));
    };
  }

}

