import aws = require('aws-sdk');
aws.config.update({region: 'ap-northeast-2'});
const dyn = new aws.DynamoDB();
let mTable = 'match-table';
let vTable = 'voter-table';

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {

  const req = event.queryStringParameters[0];
  const myIp = event.requestContext.identity.sourceIp;

  const params = {
    TableName: mTable,
    ProjectionExpression: 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, imagePath, matchId, matchResult, netComments',
    Key: {
      'matchId': {S: req}
    }
  };

  const get = await dyn.getItem(params).promise()
    .then(data => {
      const result = {
        statusCode: 200,
        body: JSON.stringify({
          message: data,
          runtime: context
        })
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

  if (JSON.parse(get.body).message === 'Getting Item Failed') {
    return get;
  }

  const voteParams = {
    TableName: vTable,
    Key: {
      'matchId': {S: req}
    },
    ProjectionExpression: 'upvoters, downvoters'
  };

  const voters = await dyn.getItem(voteParams).promise()
  .then(data => {
    const result = {
      statusCode: 200,
      body: JSON.stringify({
        message: data,
        runtime: context
      })
    };
    return result;
  })
  .catch(err => {
    const result = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Getting Voters Failed',
        runtime: err
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      }
    };
    return result;
  });

  const voteParsed = JSON.parse(voters.body);

  if (voteParsed['message'] === 'Getting Voters Failed') {
    return voters;
  }
  if (voteParsed['message']['Item'] === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Getting Voters Failed',
        runtime: 'err'
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      }
    };
  }

  const resVote = voteParsed['message']['Item'];
  let checkVote = "Not Voted";
  const upv = resVote['upvoters']['L'];
  const dov = resVote['downvoters']['L'];
  for (const u in upv) {
    if (upv[u]['S'] == myIp) {
      checkVote = 'Upvoted';
      break;
    }
  }
  for (const d in dov) {
    if (dov[d]['S'] == myIp) {
      checkVote = 'Downvoted';
      break;
    }
  }

  const result = {
    statusCode: 200,
    body: JSON.stringify({
      message: JSON.parse(get.body)['message'],
      vote: checkVote,
      runtime: context
    }),
    headers: {
      'Access-Control-Allow-Origin': 'https://stdev17.github.io',
      'Access-Control-Allow-Credentials': true,
    }
  };

  return result;
}

/** 유닛 테스트에 호출되는 함수 */
async function test (event: any, context: any, args: string[]): Promise<any> {
  mTable = args[0];
  vTable = args[1];
  return await handler(event, context);
}

export default test;