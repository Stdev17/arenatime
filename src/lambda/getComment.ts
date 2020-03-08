import { dynamoQuery } from '../util/dynamo';

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {
  const req = event.queryStringParameters[0];

  const params = {
    TableName: 'comment-table',
    IndexName: 'matches',
    ExpressionAttributeValues: {
      ':Id': { S: req },
    },
    KeyConditionExpression: 'matchId = :Id',
    ProjectionExpression: 'commentId, charName, memo, uploadedDate',
    ScanIndexForward: true,
  };

  const res: any = await dynamoQuery(params)
    .then((data: any) => {
      let status = 200;
      if (data.Count === 0) {
        status = 404;
      }
      const response = {
        statusCode: status,
        body: JSON.stringify({
          message: data,
          runtime: context,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        },
      };
      return response;
    })
    .catch(() => {
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Failed Comment Read',
          runtime: context,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        },
      };
      return response;
    });

  return res;
};
