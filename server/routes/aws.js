const express = require('express');
import {AwsService} from '../services/aws.service';
import {ErrorHandler} from '../services/errorHandler';
import {Responder} from '../services/responder';
const router = express.Router();



/**************************************************   ec2   ***********************************************************/

router.get('/ec2', AwsService.describeEc2InstancesMiddleware());

router.post('/ec2', AwsService.createEc2InstanceMiddleware());

router.put('/ec2/:instanceId/start', AwsService.startEc2InstanceMiddleware());

router.put('/ec2/:instanceId/stop', AwsService.stopEc2InstanceMiddleware());

router.put('/ec2/:instanceId/reboot', AwsService.rebootEc2InstanceMiddleware());

router.put('/ec2/number',
  AwsService.bindLoadBalancerMiddleware(),
  AwsService.bindInstanceIdsMiddleware(),
  AwsService.doChangeInstanceNumberMiddleware());

router.delete('/ec2', AwsService.terminateEc2InstancesMiddleware());


/********************************************   CloudWatch   **********************************************************/

router.get('/cloudWatch/alarms', AwsService.describeCloudWatchAlarmsMiddleware());

router.get('/cloudWatch/cpu/:instanceId', AwsService.getCpuUtilizationMiddleware());

/********************************************   LoadBalancer  *********************************************************/
router.get('/elb/instances', AwsService.bindLoadBalancerMiddleware(), function (req, res, next) {
  Promise.resolve()
    .then(() => {
      return {instanceIds: req.loadBalancer.Instances.map(i => i.InstanceId)};
    })
    .then(Responder.respondWithResult(res))
    .catch(ErrorHandler.handleError(res))
});




module.exports = router;
