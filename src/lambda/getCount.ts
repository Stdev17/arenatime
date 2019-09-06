import aws = require('aws-sdk');
aws.config.update({region: 'ap-northeast-2'});
const dyn = new aws.DynamoDB();
let table = 'match-table';

export const handler = async (event: any, context: any): Promise<any> => {
  const params = {
    TableName: table
  };

  const get = await dyn.describeTable(params).promise()
    .then(data => {
      let msg = 0;
      if (data['Table'] !== undefined) {
        if (data['Table']['ItemCount'] !== undefined) {
          msg = data['Table']['ItemCount'];
        }
      } else {
        throw 'error';
      }
      const result = {
        statusCode: 200,
        body: JSON.stringify({
          message: msg,
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
      const result = {
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

async function test (event: any, context: any, _table: string): Promise<any> {
  table = _table;
  return await handler(event, context);
}

export default test;