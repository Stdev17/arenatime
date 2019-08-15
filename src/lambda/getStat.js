const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();

module.exports.handler = async (event, context) => {

  let params = {
    TableName: 'stat-table',
    ProjectionExpression: 'PropertyName, Stats'
  };

  let items = await dyn.scan(params).promise()
  .then(data => {
    let result = {
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
    return result;
  })
  .catch(err => {
    let result = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Getting Stats Failed',
        runtime: err
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      }
    };
    console.log(err);
    return result;
  });

  return items;
}