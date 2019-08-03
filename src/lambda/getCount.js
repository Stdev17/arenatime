const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();

module.exports.handler = async (event, context) => {

  let params = {
    TableName: 'match-table'
  };

  let get = await dyn.describeTable(params).promise()
    .then(data => {
      result = {
        statusCode: 200,
        body: JSON.stringify({
          message: data['Table']['ItemCount'],
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
      result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Getting Count Failed',
          runtime: err
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      return result;
    });

    return get;
}