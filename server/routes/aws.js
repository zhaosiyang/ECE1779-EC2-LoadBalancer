const express = require('express');
import {AwsService} from '../services/aws.service';
const router = express.Router();



/**************************************************   ec2   ***********************************************************/

router.get('/ec2', AwsService.describeEc2InstancesMiddleware());

router.post('/ec2', AwsService.createEc2InstanceMiddleware());

router.put('/ec2/:instanceId/start', AwsService.startEc2InstanceMiddleware());

router.put('/ec2/:instanceId/stop', AwsService.stopEc2InstanceMiddleware());

router.put('/ec2/:instanceId/reboot', AwsService.rebootEc2InstanceMiddleware());

router.delete('/ec2/:instanceId', AwsService.terminateEc2InstanceMiddleware());

/********************************************   CloudWatch   **********************************************************/



router.get('/cloudWatch/alarms', AwsService.describeCloudWatchAlarmsMiddleware());

module.exports = router;

