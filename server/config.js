export const mysqlCredential = {
  // username: 'ece1779a1',
  // password: 'ece1779a1',
  // url: 'localhost'
  username: 'ece1779a1',
  password: 'ece1779a1_password',
  url: 'id-ece1779a1.clnur3q7z9ft.us-west-2.rds.amazonaws.com:3306'
};

export const jwtSecret = 'ahsiulfdu9278oyreub';

export const awsInstanceConfig = {
  ImageId: 'ami-e263ea82',
  InstanceType: 't2.small',
  MinCount: 1,
  MaxCount: 1,
  UserData: new Buffer(`#cloud-config 
  runcmd: 
  - /bin/bash /home/ubuntu/start`).toString('base64'),
  SecurityGroupIds: ['sg-c6ac8bbe'],
  KeyName: 'ece1779'
};