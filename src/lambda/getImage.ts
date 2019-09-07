import aws = require('aws-sdk');
aws.config.update({region: 'ap-northeast-2'});
const s3 = new aws.S3();
let bucket = 'priconne-arenatime';

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {

  const req = event.queryStringParameters[0];

  const params = {
    Bucket: bucket,
    Key: req
  };

  const get = await s3.getObject(params).promise()
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
        statusCode: 400,
        body: JSON.stringify({
          message: 'Getting Item Failed',
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
  bucket = args[0];
  return await handler(event, context);
}

export default test;