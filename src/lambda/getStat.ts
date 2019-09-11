import aws = require('aws-sdk');
aws.config.update({region: 'ap-northeast-2'});
const dyn = new aws.DynamoDB();
let table = 'stat-table';

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {

  const params = {
    TableName: table,
    ProjectionExpression: 'PropertyName, Stats'
  };

  const items = await dyn.scan(params).promise()
  .then(data => {
    const result = {
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
    const result = {
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

/** 유닛 테스트에 호출되는 함수 */
async function test (event: any, context: any, args: string[]): Promise<any> {
  table = args[0];
  return await handler(event, context);
}

export default test;