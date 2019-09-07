import aws = require('aws-sdk');
aws.config.update({region: 'ap-northeast-2'});
const dyn = new aws.DynamoDB();
let table = 'match-table';

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
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

/** 유닛 테스트에 호출되는 함수 */
async function test (event: any, context: any, args: string[]): Promise<any> {
  table = args[0];
  return await handler(event, context);
}

export default test;