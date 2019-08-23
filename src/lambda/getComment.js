const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();

module.exports.handler = async (event, context) => {

  let req = event.queryStringParameters[0];

  let params = {
    TableName: 'comment-table',
    IndexName: 'matches',
    ExpressionAttributeValues: {
      ':Id': {S: req}
    },
    KeyConditionExpression: 'matchId = :Id',
    ProjectionExpression: 'commentId, charName, memo, uploadedDate',
    ScanIndexForward: true
  };

  let res = await dyn.query(params).promise()
    .then(data => {
      let response = {
        statusCode: 200,
        body: JSON.stringify({
          message: data,
          runtime: context
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      return response;
    })
    .catch(err => {
      console.log(err);
      let response = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Failed Comment Read',
          runtime: context
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      return response;
    });

  return res;

}