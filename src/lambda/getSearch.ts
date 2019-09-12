import aws = require('aws-sdk');
import primeChar from '../util/prime';
import moment = require('moment');
aws.config.update({region: 'ap-northeast-2'});
const dyn = new aws.DynamoDB();
let table = 'match-table';

function setId(req: any): number {
  let id = 1;
  const deck = req.deck;
  for (const tmp in deck) {
    id *= primeChar[deck[tmp]];
  }
  if (id === NaN) {
    return 1;
  }
  return id;
}

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {

  const req = JSON.parse(event.queryStringParameters[0]);
  const deckId = setId(req);

  let params: any = {};
  params = {
    TableName: table,
    ExpressionAttributeValues: {
      ':deckId': {N: deckId.toString()}
    }
  };

  if (req.arena === 'battleArena') {
    params.ExpressionAttributeValues[':arena'] = {S: 'princessArena'};
  }
  if (req.arena === 'princessArena') {
    params.ExpressionAttributeValues[':arena'] = {S: 'battleArena'};
  }
  if (req.arena === 'all') {
    params.ExpressionAttributeValues[':arena'] = {S: 'all'};
  }

  let date;
  switch (req.date) {
    case "all":
      date = moment().subtract(5, 'years').format("YYYY-MM-DD HH:mm:ss");
      params.ExpressionAttributeValues[':date'] = {S: date};
      break;
    case "week":
      date = moment().subtract(7, 'days').format("YYYY-MM-DD HH:mm:ss");
      params.ExpressionAttributeValues[':date'] = {S: date};
      break;
    case "month":
      date = moment().subtract(30, 'days').format("YYYY-MM-DD HH:mm:ss");
      params.ExpressionAttributeValues[':date'] = {S: date};
      break;
    case "season":
      date = moment().subtract(90, 'days').format("YYYY-MM-DD HH:mm:ss");
      params.ExpressionAttributeValues[':date'] = {S: date};
      break;
    default:
      break;
  }

  switch (req.power) {
    case "all":
      params.ExpressionAttributeValues[':upper'] = {N: '100000'};
      params.ExpressionAttributeValues[':lower'] = {N: '-1'};
      break;
    case ">55000":
      params.ExpressionAttributeValues[':upper'] = {N: '80000'};
      params.ExpressionAttributeValues[':lower'] = {N: '55000'};
      break;
    case ">50000":
      params.ExpressionAttributeValues[':upper'] = {N: '55000'};
      params.ExpressionAttributeValues[':lower'] = {N: '50000'};
      break;
    case ">45000":
      params.ExpressionAttributeValues[':upper'] = {N: '50000'};
      params.ExpressionAttributeValues[':lower'] = {N: '45000'};
      break;
    case ">40000":
      params.ExpressionAttributeValues[':upper'] = {N: '45000'};
      params.ExpressionAttributeValues[':lower'] = {N: '40000'};
      break;
    case "<40000":
      params.ExpressionAttributeValues[':upper'] = {N: '40000'};
      params.ExpressionAttributeValues[':lower'] = {N: '50'};
      break;
    default:
      break;
  }

  if (req.target === 'defense' && req.sort === 'netUpvotes') {
    params.IndexName = 'defenseVotes';
    if (req.result === 'victory') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else if (req.result === 'all') {
      params.ExpressionAttributeValues[':result'] = {S: 'all'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'defenseDeckId = :deckId';
    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
    params.FilterExpression = 'defensePower > :lower and defensePower < :upper and uploadedDate > :date and arena <> :arena and matchResult <> :result';
  }

  if (req.target === 'attack' && req.sort === 'netUpvotes') {
    params.IndexName = 'attackVotes';
    if (req.result === 'defeat') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else if (req.result === 'all') {
      params.ExpressionAttributeValues[':result'] = {S: 'all'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'attackDeckId = :deckId';
    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
    params.FilterExpression = 'attackPower > :lower and attackPower < :upper and uploadedDate > :date and arena <> :arena and matchResult <> :result';
  }

  if (req.target === 'defense' && req.sort === 'latest') {
    params.IndexName = 'defenseDate';
    if (req.result === 'victory') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else if (req.result === 'all') {
      params.ExpressionAttributeValues[':result'] = {S: 'all'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'defenseDeckId = :deckId and uploadedDate > :date';
    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
    params.FilterExpression = 'defensePower > :lower and defensePower < :upper and arena <> :arena and matchResult <> :result';
  }

  if (req.target === 'attack' && req.sort === 'latest') {
    params.IndexName = 'attackDate';
    if (req.result === 'defeat') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else if (req.result === 'all') {
      params.ExpressionAttributeValues[':result'] = {S: 'all'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'attackDeckId = :deckId and uploadedDate > :date';
    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
    params.FilterExpression = 'attackPower > :lower and attackPower < :upper and arena <> :arena and matchResult <> :result';
  }

  let queries: any[] = [];
  queries = [];

  const get = await dyn.query(params).promise()
    .then(data => {
      if (queries.length === 0 && data['Count'] !== 0) {
        queries.push(data);
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Query Succeeded',
            runtime: 'ok'
          })
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No Result',
          runtime: 'ok'
        })
      };
    })
    .catch(err => {
      const result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Query Failed',
          runtime: err
        })
      };
      return result;
    });

  if (get.statusCode === 400) {
    return get;
  }

  if (queries.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Deck Not Found',
        runtime: context
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      }
    };
  }

  let res = [];
  res = [];
  let buf = [];
  buf = [];
  let tmp: any;
  for (const i in queries) {
    for (const j in queries[i]['Items']) {
      buf.push(queries[i]['Items'][j]);
    }
  }
  for (let i = 0; i < buf.length; i++) {
    if (i % 5 === 0) {
      tmp = {'Items': []};
    }
    tmp['Items'].push(buf[i]);
    if (i % 5 === 4) {
      res.push(tmp);
    }
  }
  if (buf.length % 5 !== 0) {
    res.push(tmp);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: res,
      runtime: context
    }),
    headers: {
      'Access-Control-Allow-Origin': 'https://stdev17.github.io',
      'Access-Control-Allow-Credentials': true,
    }
  };
}

/** 유닛 테스트에 호출되는 함수 */
async function test (event: any, context: any, args: string[]): Promise<any> {
  table = args[0];
  return await handler(event, context);
}

export default test;