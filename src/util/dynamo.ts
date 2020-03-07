import aws = require('aws-sdk');
aws.config.update({ region: 'ap-northeast-2' });
const dyn = new aws.DynamoDB();

export const dynamoQuery = (params: any): any => {
  return dyn.query(params).promise();
};
